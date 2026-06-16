const { idInput } = require('../../../utils/inputs');

const Errors = {
  CRM_LEAD_NOT_FOUND: {
    crmLeadNotFound: 'CRM lead not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    assignedUserId: idInput,
    companyName: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
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

  exits: {
    crmLeadNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const crmLead = await CrmLead.findOne({ id: inputs.id });

    if (!crmLead) {
      throw Errors.CRM_LEAD_NOT_FOUND;
    }

    const values = _.omitBy(
      _.pick(inputs, [
        'assignedUserId',
        'companyName',
        'contactName',
        'contactEmail',
        'contactPhone',
        'serviceInterest',
        'stage',
        'estimatedValue',
        'notes',
        'expectedCloseDate',
      ]),
      _.isUndefined,
    );

    const updatedCrmLeads = await CrmLead.update({ id: inputs.id }, values).fetch();
    const updatedCrmLead = updatedCrmLeads[0];

    if (!updatedCrmLead) {
      throw Errors.CRM_LEAD_NOT_FOUND;
    }

    return {
      item: updatedCrmLead,
    };
  },
};
