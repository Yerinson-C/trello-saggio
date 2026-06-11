/*!
 * List inbound emails for a project or card
 * GET /api/projects/:projectId/inbound-emails
 * GET /api/cards/:cardId/inbound-emails
 */

const { idInput } = require('../../../utils/inputs');

module.exports = {
  inputs: {
    projectId: { ...idInput, required: true },
    cardId: idInput,
    page: { type: 'number', min: 1, defaultsTo: 1 },
    perPage: { type: 'number', min: 1, max: 100, defaultsTo: 50 },
  },

  exits: {
    projectNotFound: { responseType: 'notFound' },
    notEnoughRights: { responseType: 'forbidden' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne({ id: inputs.projectId });
    if (!project) throw { projectNotFound: 'Project not found' };

    const isMember = await sails.helpers.users.isProjectMember(currentUser.id, project.id);
    if (!isMember && currentUser.role !== 'admin') throw { notEnoughRights: 'Not enough rights' };

    const criteria = { projectId: inputs.projectId };
    if (inputs.cardId) criteria.cardId = inputs.cardId;

    const skip = (inputs.page - 1) * inputs.perPage;
    const emails = await InboundEmail.find(criteria)
      .sort('receivedAt DESC')
      .limit(inputs.perPage)
      .skip(skip);

    const total = await InboundEmail.count(criteria);

    // Attach attachments
    const emailIds = emails.map((e) => e.id);
    const attachments = emailIds.length
      ? await InboundEmailAttachment.find({ inboundEmailId: emailIds })
      : [];

    const attsByEmailId = {};
    attachments.forEach((a) => {
      if (!attsByEmailId[a.inboundEmailId]) attsByEmailId[a.inboundEmailId] = [];
      attsByEmailId[a.inboundEmailId].push(a);
    });

    const items = emails.map((e) => ({
      ...e,
      attachments: attsByEmailId[e.id] || [],
    }));

    return { items, total };
  },
};
