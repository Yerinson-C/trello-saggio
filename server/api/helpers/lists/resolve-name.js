/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    t: {
      type: 'ref',
    },
  },

  fn(inputs) {
    if (inputs.record.name) {
      return inputs.record.name;
    }

    const name = _.upperFirst(inputs.record.type);
    return inputs.t ? inputs.t(name) : name;
  },
};
