/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    total: {
      type: 'number',
      required: true,
    },
  },

  async fn(inputs) {
    const queryResult = await sails.sendNativeQuery(
      'SELECT next_id() as id from generate_series(1, $1) ORDER BY id',
      [inputs.total],
    );

    return sails.helpers.utils.mapRecords(queryResult.rows);
  },
};
