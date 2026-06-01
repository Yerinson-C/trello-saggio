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
    exceptProjectManagerIdOrIds: {
      type: 'json',
    },
  },

  async fn(inputs) {
    const projectManagers = await ProjectManager.qm.getByProjectId(inputs.id, {
      exceptIdOrIds: inputs.exceptProjectManagerIdOrIds,
    });

    return projectManagers.length;
  },
};
