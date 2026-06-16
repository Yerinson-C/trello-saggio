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
    cardId: idInput,
    description: {
      type: 'string',
      maxLength: 512,
      allowNull: true,
    },
    hours: {
      type: 'number',
      required: true,
    },
    entryDate: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne({ id: inputs.projectId });

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const id = await sails.helpers.utils.generateId();

    const values = {
      id,
      projectId: inputs.projectId,
      userId: currentUser.id,
      cardId: inputs.cardId || null,
      description: inputs.description || null,
      hours: inputs.hours,
      entryDate: inputs.entryDate,
    };

    const timeEntry = await TimeEntry.create(values).fetch();

    return {
      item: timeEntry,
    };
  },
};
