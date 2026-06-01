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
    const backgroundImage = await BackgroundImage.qm.getOneById(inputs.id);

    if (!backgroundImage) {
      throw 'pathNotFound';
    }

    const project = await Project.qm.getOneById(backgroundImage.projectId);

    if (!project) {
      throw {
        pathNotFound: {
          backgroundImage,
        },
      };
    }

    return {
      backgroundImage,
      project,
    };
  },
};
