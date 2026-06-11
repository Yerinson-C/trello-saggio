/*!
 * Convert an inbound email to task, comment, or evidence
 * POST /api/inbound-emails/:id/convert
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_FOUND: { emailNotFound: 'Email not found' },
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
  ALREADY_PROCESSED: { alreadyProcessed: 'Email already processed' },
  CARD_REQUIRED: { cardRequired: 'Card ID required for this conversion type' },
};

module.exports = {
  inputs: {
    id: { ...idInput, required: true },
    convertTo: {
      type: 'string',
      isIn: ['task', 'comment', 'evidence'],
      required: true,
    },
    cardId: idInput,
    taskListId: idInput,
  },

  exits: {
    emailNotFound: { responseType: 'notFound' },
    notEnoughRights: { responseType: 'forbidden' },
    alreadyProcessed: { responseType: 'conflict' },
    cardRequired: { responseType: 'unprocessableEntity' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const email = await InboundEmail.findOne({ id: inputs.id });
    if (!email) throw Errors.NOT_FOUND;

    if (email.isProcessed) throw Errors.ALREADY_PROCESSED;

    const isMember = await sails.helpers.users.isProjectMember(currentUser.id, email.projectId);
    if (!isMember && currentUser.role !== 'admin') throw Errors.NOT_ENOUGH_RIGHTS;

    const targetCardId = inputs.cardId || email.cardId;

    let processedItemId = null;

    if (inputs.convertTo === 'task') {
      if (!inputs.taskListId) {
        // Find first task list of the card or create one
        if (!targetCardId) throw Errors.CARD_REQUIRED;

        let taskList = await TaskList.findOne({ cardId: targetCardId });
        if (!taskList) {
          taskList = await TaskList.create({
            id: sails.helpers.utils.generateIds(1)[0],
            cardId: targetCardId,
            name: 'Correos',
            position: 65536,
          }).fetch();
        }
        inputs.taskListId = taskList.id;
      }

      const taskName = `[Email] ${email.subject} — de: ${email.fromEmail}`;
      const task = await Task.create({
        id: sails.helpers.utils.generateIds(1)[0],
        taskListId: inputs.taskListId,
        name: taskName.slice(0, 1024),
        position: Date.now(),
        status: 'not_started',
      }).fetch();

      processedItemId = task.id;

    } else if (inputs.convertTo === 'comment') {
      if (!targetCardId) throw Errors.CARD_REQUIRED;

      const body = [
        `**Correo recibido de:** ${email.fromName || ''} <${email.fromEmail}>`,
        `**Asunto:** ${email.subject}`,
        `**Fecha:** ${email.receivedAt}`,
        '',
        '---',
        email.bodyText || '(sin contenido)',
      ].join('\n');

      const comment = await Comment.create({
        id: sails.helpers.utils.generateIds(1)[0],
        cardId: targetCardId,
        userId: currentUser.id,
        text: body.slice(0, 65535),
      }).fetch();

      processedItemId = comment.id;

    } else if (inputs.convertTo === 'evidence') {
      if (!targetCardId) throw Errors.CARD_REQUIRED;

      // Store as a comment with attachment references
      const attList = await InboundEmailAttachment.find({ inboundEmailId: email.id });
      const attLines = attList.map((a) => `- [${a.filename}](${a.url})`).join('\n');

      const body = [
        `**Evidencia — Correo:** ${email.subject}`,
        `**De:** ${email.fromEmail}`,
        `**Fecha:** ${email.receivedAt}`,
        '',
        email.bodyText || '',
        attLines ? `\n**Adjuntos:**\n${attLines}` : '',
      ].join('\n');

      const comment = await Comment.create({
        id: sails.helpers.utils.generateIds(1)[0],
        cardId: targetCardId,
        userId: currentUser.id,
        text: body.slice(0, 65535),
      }).fetch();

      processedItemId = comment.id;
    }

    const updated = await InboundEmail.updateOne({ id: email.id }).set({
      isProcessed: true,
      processedAs: inputs.convertTo,
      processedItemId,
    });

    return { item: updated };
  },
};
