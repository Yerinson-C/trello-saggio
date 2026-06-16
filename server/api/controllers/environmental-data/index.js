const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const project = await Project.findOne({ id: inputs.projectId });

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const environmentalData = await EnvironmentalData.find({ projectId: inputs.projectId }).sort('createdAt DESC');

    return {
      items: environmentalData,
    };
  },
};
