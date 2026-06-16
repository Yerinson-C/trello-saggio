module.exports = {
  inputs: {},

  exits: {},

  async fn() {
    const crmLeads = await CrmLead.find().sort('createdAt DESC');

    return {
      items: crmLeads,
    };
  },
};
