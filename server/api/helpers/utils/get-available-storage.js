/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

const bytes = require('bytes');

module.exports = {
  async fn() {
    let { storageLimit } = await InternalConfig.qm.getOneMain();
    storageLimit = bytes(storageLimit);

    if (storageLimit === null) {
      return null;
    }

    const storageUsage = await StorageUsage.qm.getOneMain();
    return BigInt(storageLimit) - BigInt(storageUsage.total);
  },
};
