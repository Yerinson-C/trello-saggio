/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    userId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const boardMemberships = await BoardMembership.qm.getByProjectIdAndUserId(
      inputs.id,
      inputs.userId,
    );

    return boardMemberships.length;
  },
};
