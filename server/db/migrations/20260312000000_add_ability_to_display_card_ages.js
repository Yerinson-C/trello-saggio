/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.boolean('display_card_ages').notNullable().defaultTo(false);
  });

  return knex.schema.alterTable('board', (table) => {
    table.boolean('display_card_ages').notNullable().alter();
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('display_card_ages');
  });
