/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

/* Query methods */

const getOneMain = () => Config.findOne(Config.MAIN_ID);

const updateOneMain = (values) => Config.updateOne(Config.MAIN_ID).set({ ...values });

module.exports = {
  getOneMain,
  updateOneMain,
};
