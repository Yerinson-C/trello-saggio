/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');

module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    withHttpOnlyToken: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    return Session.qm.createOne({
      ...values,
      httpOnlyToken: inputs.withHttpOnlyToken ? uuid() : null,
    });
  },
};
