/**
 * CrmLead.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'crm_lead',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    companyName: {
      type: 'string',
      maxLength: 256,
      required: true,
      columnName: 'company_name',
    },

    contactName: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
      columnName: 'contact_name',
    },

    contactEmail: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
      columnName: 'contact_email',
    },

    contactPhone: {
      type: 'string',
      maxLength: 64,
      allowNull: true,
      columnName: 'contact_phone',
    },

    serviceInterest: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
      columnName: 'service_interest',
    },

    stage: {
      type: 'string',
      maxLength: 32,
      defaultsTo: 'prospecto',
      columnName: 'stage',
    },

    estimatedValue: {
      type: 'number',
      allowNull: true,
      columnName: 'estimated_value',
    },

    notes: {
      type: 'string',
      allowNull: true,
      columnName: 'notes',
    },

    expectedCloseDate: {
      type: 'ref',
      columnType: 'timestamptz',
      allowNull: true,
      columnName: 'expected_close_date',
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    assignedUserId: {
      model: 'User',
      allowNull: true,
      columnName: 'assigned_user_id',
    },
  },
};
