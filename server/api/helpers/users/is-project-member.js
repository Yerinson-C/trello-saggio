module.exports = {
  inputs: {
    userId: { type: 'string', required: true },
    projectId: { type: 'string', required: true },
  },

  async fn(inputs) {
    const isManager = await sails.helpers.users.isProjectManager(inputs.userId, inputs.projectId);
    if (isManager) return true;

    const total = await sails.helpers.projects.getBoardMembershipsTotalByIdAndUserId(
      inputs.projectId,
      inputs.userId,
    );
    return total > 0;
  },
};
