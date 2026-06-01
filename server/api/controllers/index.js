/*!
 * Copyright (c) 2025 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  exits: {
    success: {
      responseType: 'view',
      viewTemplatePath: 'index',
    },
  },

  fn() {
    return {
      basePath: sails.config.custom.baseUrlPath,
    };
  },
};
