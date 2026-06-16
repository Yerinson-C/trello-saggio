const { idInput } = require('../../../utils/inputs');

module.exports = {
  inputs: {
    assignedUserId: idInput,
    companyName: {
      type: 'string',
      maxLength: 256,
      required: true,
    },
    contactName: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
    },
    contactEmail: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
    },
    contactPhone: {
      type: 'string',
      maxLength: 64,
      allowNull: true,
    },
    serviceInterest: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
    },
    stage: {
      type: 'string',
      maxLength: 32,
      allowNull: true,
    },
    estimatedValue: {
      type: 'number',
      allowNull: true,
    },
    notes: {
      type: 'string',
      allowNull: true,
    },
    expectedCloseDate: {
      type: 'string',
      allowNull: true,
    },
  },

  exits: {},

  async fn(inputs) {
    const id = await sails.helpers.utils.generateId();

    const values = {
      id,
      assignedUserId: inputs.assignedUserId || null,
      companyName: inputs.companyName,
      contactName: inputs.contactName || null,
      contactEmail: inputs.contactEmail || null,
      contactPhone: inputs.contactPhone || null,
      serviceInterest: inputs.serviceInterest || null,
      stage: inputs.stage || 'prospecto',
      estimatedValue: inputs.estimatedValue || null,
      notes: inputs.notes || null,
      expectedCloseDate: inputs.expectedCloseDate || null,
    };

    const crmLead = await CrmLead.create(values).fetch();

    return {
      item: crmLead,
    };
  },
};
