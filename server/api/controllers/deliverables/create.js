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
    name: {
      type: 'string',
      maxLength: 256,
      required: true,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    status: {
      type: 'string',
      maxLength: 32,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      allowNull: true,
    },
    fileUrl: {
      type: 'string',
      maxLength: 1024,
      allowNull: true,
    },
    fileName: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
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
      createdByUserId: currentUser.id,
      name: inputs.name,
      description: inputs.description || null,
      status: inputs.status || 'draft',
      dueDate: inputs.dueDate || null,
      fileUrl: inputs.fileUrl || null,
      fileName: inputs.fileName || null,
    };

    const deliverable = await Deliverable.create(values).fetch();

    return {
      item: deliverable,
    };
  },
};
