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
    exceptListIdOrIds: {
      type: 'json',
    },
  },

  async fn(inputs) {
    return List.qm.getByBoardId(inputs.id, {
      exceptIdOrIds: inputs.exceptListIdOrIds,
      typeOrTypes: List.KANBAN_TYPES,
    });
  },
};
