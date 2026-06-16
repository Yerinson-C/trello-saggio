/**
 * EmissionFactor.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'emission_factor',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      maxLength: 256,
      required: true,
      columnName: 'name',
    },

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

    unitInput: {
      type: 'string',
      maxLength: 32,
      required: true,
      columnName: 'unit_input',
    },

    unitOutput: {
      type: 'string',
      maxLength: 32,
      defaultsTo: 'kgCO2e',
      columnName: 'unit_output',
    },

    factor: {
      type: 'number',
      required: true,
      columnName: 'factor',
    },

    source: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
      columnName: 'source',
    },

    country: {
      type: 'string',
      maxLength: 64,
      allowNull: true,
      columnName: 'country',
    },

    year: {
      type: 'number',
      allowNull: true,
      columnName: 'year',
    },
  },
};
