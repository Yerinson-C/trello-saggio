/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    response: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    inputs.response.clearCookie('httpOnlyToken', {
      path: sails.config.custom.baseUrlPath || '/',
    });
  },
};
