/**
 * Deliverable.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'deliverable',

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

    description: {
      type: 'string',
      allowNull: true,
      columnName: 'description',
    },

    status: {
      type: 'string',
      maxLength: 32,
      defaultsTo: 'draft',
      columnName: 'status',
    },

    dueDate: {
      type: 'ref',
      columnType: 'timestamptz',
      columnName: 'due_date',
    },

    fileUrl: {
      type: 'string',
      maxLength: 1024,
      allowNull: true,
      columnName: 'file_url',
    },

    fileName: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
      columnName: 'file_name',
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },

    createdByUserId: {
      model: 'User',
      required: true,
      columnName: 'created_by_user_id',
    },
  },
};
