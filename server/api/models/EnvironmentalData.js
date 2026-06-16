/**
 * EnvironmentalData.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'environmental_data',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    category: {
      type: 'string',
      maxLength: 64,
      required: true,
      columnName: 'category',
    },

    subcategory: {
      type: 'string',
      maxLength: 128,
      allowNull: true,
      columnName: 'subcategory',
    },

    scope: {
      type: 'string',
      maxLength: 16,
      allowNull: true,
      columnName: 'scope',
    },

    quantity: {
      type: 'number',
      required: true,
      columnName: 'quantity',
    },

    unit: {
      type: 'string',
      maxLength: 32,
      required: true,
      columnName: 'unit',
    },

    period: {
      type: 'string',
      maxLength: 64,
      allowNull: true,
      columnName: 'period',
    },

    source: {
      type: 'string',
      allowNull: true,
      columnName: 'source',
    },

    notes: {
      type: 'string',
      allowNull: true,
      columnName: 'notes',
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },

    recordedByUserId: {
      model: 'User',
      required: true,
      columnName: 'recorded_by_user_id',
    },
  },
};
