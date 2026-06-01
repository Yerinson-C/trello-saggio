/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    roleOrRoles: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const users = await User.qm.getAll({
      roleOrRoles: inputs.roleOrRoles,
      isDeactivated: false,
    });

    return sails.helpers.utils.mapRecords(users);
  },
};
