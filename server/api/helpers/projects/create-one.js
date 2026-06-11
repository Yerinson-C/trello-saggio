/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    // Auto-assign short sequential project code for email tokens (SGG-PROY-102)
    const maxCodeResult = await Project.count();
    values.projectCode = maxCodeResult + 1;

    const { project, projectManager } = await Project.qm.createOne(values, {
      user: inputs.actorUser,
    });

    const scoper = sails.helpers.projects.makeScoper.with({
      record: project,
    });

    scoper.projectManagerUserIds = [projectManager.userId];
    const userIdsWithFullProjectVisibility = await scoper.getUserIdsWithFullProjectVisibility();

    userIdsWithFullProjectVisibility.forEach((userId) => {
      // TODO: send projectManager in included
      sails.sockets.broadcast(
        `user:${userId}`,
        'projectCreate',
        {
          item: project,
        },
        inputs.request,
      );
    });

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.PROJECT_CREATE,
      buildData: () => ({
        item: project,
      }),
      user: inputs.actorUser,
    });

    return {
      project,
      projectManager,
    };
  },
};
