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

    const deletedCrmLead = await CrmLead.destroyOne({ id: inputs.id });

    if (!deletedCrmLead) {
      throw Errors.CRM_LEAD_NOT_FOUND;
    }

    return {
      item: deletedCrmLead,
    };
  },
};
