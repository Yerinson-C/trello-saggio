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
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const label = await Label.qm.getOneById(inputs.id);

    if (!label) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(label.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          label,
          ...nodes,
        },
      }));

    return {
      label,
      ...pathToProject,
    };
  },
};
