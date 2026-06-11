/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

const ProcessedAs = {
  TASK: 'task',
  COMMENT: 'comment',
  EVIDENCE: 'evidence',
};

module.exports = {
  ProcessedAs,

  tableName: 'inbound_email',

  attributes: {
    fromEmail: {
      type: 'string',
      required: true,
      columnName: 'from_email',
    },
    fromName: {
      type: 'string',
      allowNull: true,
      columnName: 'from_name',
    },
    subject: {
      type: 'string',
      required: true,
    },
    bodyText: {
      type: 'string',
      allowNull: true,
      columnName: 'body_text',
    },
    bodyHtml: {
      type: 'string',
      allowNull: true,
      columnName: 'body_html',
    },
    token: {
      type: 'string',
      allowNull: true,
    },
    messageId: {
      type: 'string',
      allowNull: true,
      columnName: 'message_id',
    },
    inReplyTo: {
      type: 'string',
      allowNull: true,
      columnName: 'in_reply_to',
    },
    threadId: {
      type: 'string',
      allowNull: true,
      columnName: 'thread_id',
    },
    isProcessed: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_processed',
    },
    processedAs: {
      type: 'string',
      isIn: Object.values(ProcessedAs),
      allowNull: true,
      columnName: 'processed_as',
    },
    processedItemId: {
      type: 'string',
      allowNull: true,
      columnName: 'processed_item_id',
    },
    receivedAt: {
      type: 'ref',
      columnName: 'received_at',
    },

    projectId: {
      model: 'Project',
      columnName: 'project_id',
    },
    cardId: {
      model: 'Card',
      columnName: 'card_id',
    },
  },
};
