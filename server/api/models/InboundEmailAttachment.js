/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  tableName: 'inbound_email_attachment',

  attributes: {
    filename: {
      type: 'string',
      required: true,
    },
    contentType: {
      type: 'string',
      allowNull: true,
      columnName: 'content_type',
    },
    size: {
      type: 'number',
      allowNull: true,
    },
    url: {
      type: 'string',
      allowNull: true,
    },
    inboundEmailId: {
      model: 'InboundEmail',
      columnName: 'inbound_email_id',
    },
  },
};
