/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

const initKnex = require('knex');

const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

(async () => {
  try {
    await knex.migrate.latest();
    await knex.seed.run();
  } catch (error) {
    process.exitCode = 1;
    throw error;
  } finally {
    knex.destroy();
  }
})();
