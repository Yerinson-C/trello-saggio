module.exports = {
  inputs: {
    projectId: { type: 'string', required: true },
  },

  async fn(inputs) {
    const boards = await Board.find({ projectId: inputs.projectId }).select(['id']);
    return boards.map((b) => b.id);
  },
};
