/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

const crypto = require('crypto');

module.exports = {
  sync: true,

  inputs: {
    data: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    return crypto.createHash('sha256').update(inputs.data).digest('hex');
  },
};
