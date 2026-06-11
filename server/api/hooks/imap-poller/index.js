/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

/**
 * imap-poller hook
 *
 * Polls an IMAP mailbox for inbound project emails.
 * Parses tokens like [SGG-PROY-102-ACT-450] from subject lines
 * and associates emails to the matching project/card.
 *
 * Required env vars:
 *   IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASSWORD
 * Optional:
 *   IMAP_TLS=true (default true)
 *   IMAP_POLL_INTERVAL_MS=120000 (default 2 min)
 *   EMAIL_TOKEN_PREFIX=SGG (default)
 *   EMAIL_INBOUND_DIR=data/inbound-attachments
 */

const TOKEN_REGEX = /\[([A-Z]{2,6})-PROY-(\d+)(?:-ACT-(\d+))?\]/i;
const fs = require('fs');
const path = require('path');

module.exports = function defineImapPollerHook(sails) {
  let pollerInterval = null;

  async function processEmail(parsed, projectId, cardId, token) {
    const sailsId = sails.helpers.utils.generateIds(1)[0];

    // Determine thread: use existing thread from In-Reply-To or start new one
    let threadId = parsed.messageId;
    if (parsed.inReplyTo) {
      const parent = await InboundEmail.findOne({ messageId: parsed.inReplyTo });
      if (parent) {
        threadId = parent.threadId || parent.messageId;
        if (!cardId && parent.cardId) {
          cardId = parent.cardId; // eslint-disable-line no-param-reassign
        }
      }
    }

    const email = await InboundEmail.create({
      id: sailsId,
      projectId,
      cardId: cardId || null,
      messageId: parsed.messageId || null,
      inReplyTo: parsed.inReplyTo || null,
      threadId,
      fromEmail: parsed.from?.value?.[0]?.address || 'unknown',
      fromName: parsed.from?.value?.[0]?.name || null,
      subject: parsed.subject || '(sin asunto)',
      bodyText: parsed.text || null,
      bodyHtml: parsed.html || null,
      token: token || null,
      receivedAt: parsed.date || new Date(),
    }).fetch();

    // Save attachments
    const attachmentDir = path.join(
      sails.config.appPath,
      process.env.EMAIL_INBOUND_DIR || 'data/inbound-attachments',
    );
    if (!fs.existsSync(attachmentDir)) {
      fs.mkdirSync(attachmentDir, { recursive: true });
    }

    for (const att of parsed.attachments || []) {
      try {
        const safeName = att.filename?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'attachment';
        const fileName = `${email.id}_${safeName}`;
        const filePath = path.join(attachmentDir, fileName);
        fs.writeFileSync(filePath, att.content);
        const attId = sails.helpers.utils.generateIds(1)[0];
        await InboundEmailAttachment.create({
          id: attId,
          inboundEmailId: email.id,
          filename: att.filename || safeName,
          contentType: att.contentType || null,
          size: att.size || att.content?.length || null,
          url: `/data/inbound-attachments/${fileName}`,
        });
      } catch (e) {
        sails.log.warn('[imap-poller] Failed to save attachment:', e.message);
      }
    }

    // Broadcast to project members
    if (projectId) {
      const scoper = sails.helpers.projects.makeScoper.with({
        record: { id: projectId },
      });
      try {
        const userIds = await scoper.getUserIdsWithFullProjectVisibility();
        userIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'inboundEmailCreate', { item: email });
        });
      } catch (e) {
        // scoper might fail if project doesn't exist
      }
    }

    sails.log.info(`[imap-poller] Saved email "${email.subject}" → project ${projectId}`);
    return email;
  }

  async function pollMailbox() {
    const host = process.env.IMAP_HOST;
    const user = process.env.IMAP_USER;
    const password = process.env.IMAP_PASSWORD;

    if (!host || !user || !password) {
      return; // Not configured
    }

    let ImapFlow, simpleParser;
    try {
      ImapFlow = require('imapflow').ImapFlow; // eslint-disable-line
      simpleParser = require('mailparser').simpleParser; // eslint-disable-line
    } catch (e) {
      sails.log.warn('[imap-poller] imapflow/mailparser not installed. Run: npm install imapflow mailparser');
      return;
    }

    const client = new ImapFlow({
      host,
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      secure: process.env.IMAP_TLS !== 'false',
      auth: { user, pass: password },
      logger: false,
    });

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        // Fetch all UNSEEN messages
        const messages = [];
        for await (const msg of client.fetch({ seen: false }, { source: true, envelope: true })) {
          messages.push(msg);
        }

        const prefix = process.env.EMAIL_TOKEN_PREFIX || 'SGG';
        const tokenRegex = new RegExp(`\\[${prefix}-PROY-(\\d+)(?:-ACT-(\\d+))?\\]`, 'i');

        for (const msg of messages) {
          try {
            const parsed = await simpleParser(msg.source);
            const subject = parsed.subject || '';
            const match = subject.match(tokenRegex);

            let projectId = null;
            let cardId = null;
            let token = null;

            if (match) {
              const projectCode = parseInt(match[1], 10);
              const activityCode = match[2] ? parseInt(match[2], 10) : null;
              token = match[0];

              const project = await Project.findOne({ projectCode });
              if (project) {
                projectId = project.id;

                if (activityCode) {
                  const card = await Card.findOne({ activityCode, boardId: { in: await sails.helpers.projects.getBoardIdsByProjectId(projectId) } });
                  if (card) cardId = card.id;
                }
              }
            }

            if (projectId) {
              // Check not already saved (by Message-ID)
              const exists = parsed.messageId
                ? await InboundEmail.findOne({ messageId: parsed.messageId })
                : null;

              if (!exists) {
                await processEmail(parsed, projectId, cardId, token);
                // Mark as SEEN
                await client.messageFlagsAdd(msg.seq, ['\\Seen']);
              }
            }
          } catch (e) {
            sails.log.warn('[imap-poller] Error processing message:', e.message);
          }
        }
      } finally {
        lock.release();
      }

      await client.logout();
    } catch (e) {
      sails.log.warn('[imap-poller] IMAP connection error:', e.message);
      try { await client.logout(); } catch (_) {}
    }
  }

  return {
    async initialize() {
      if (!process.env.IMAP_HOST) {
        sails.log.info('[imap-poller] IMAP not configured (set IMAP_HOST to enable)');
        return;
      }

      sails.log.info('[imap-poller] Starting email poller');

      const intervalMs = parseInt(process.env.IMAP_POLL_INTERVAL_MS || '120000', 10);

      // Initial poll after 10s
      setTimeout(() => pollMailbox(), 10000);
      pollerInterval = setInterval(() => pollMailbox(), intervalMs);
    },

    async teardown() {
      if (pollerInterval) {
        clearInterval(pollerInterval);
      }
    },
  };
};
