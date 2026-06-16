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
    category: {
      type: 'string',
      maxLength: 64,
      required: true,
    },
    subcategory: {
      type: 'string',
      maxLength: 128,
      allowNull: true,
    },
    scope: {
      type: 'string',
      maxLength: 16,
      allowNull: true,
    },
    quantity: {
      type: 'number',
      required: true,
    },
    unit: {
      type: 'string',
      maxLength: 32,
      required: true,
    },
    period: {
      type: 'string',
      maxLength: 64,
      allowNull: true,
    },
    source: {
      type: 'string',
      allowNull: true,
    },
    notes: {
      type: 'string',
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
      recordedByUserId: currentUser.id,
      category: inputs.category,
      subcategory: inputs.subcategory || null,
      scope: inputs.scope || null,
      quantity: inputs.quantity,
      unit: inputs.unit,
      period: inputs.period || null,
      source: inputs.source || null,
      notes: inputs.notes || null,
    };

    const environmentalData = await EnvironmentalData.create(values).fetch();

    return {
      item: environmentalData,
    };
  },
};
