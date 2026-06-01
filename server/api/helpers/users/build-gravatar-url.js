/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

const crypto = require('crypto');

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    if (!sails.config.custom.gravatarBaseUrl) {
      return null;
    }

    const hash = crypto.createHash('sha256').update(inputs.record.email).digest('hex');
    return `${sails.config.custom.gravatarBaseUrl}${hash}?s=180&d=initials`;
  },
};
