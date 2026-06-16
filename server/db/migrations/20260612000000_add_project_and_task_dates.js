/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('project', (table) => {
    table.timestamp('start_date', { useTz: true }).nullable().defaultTo(null);
    table.timestamp('end_date', { useTz: true }).nullable().defaultTo(null);
  });

  await knex.schema.alterTable('task', (table) => {
    table.timestamp('start_date', { useTz: true }).nullable().defaultTo(null);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('task', (table) => {
    table.dropColumn('start_date');
  });

  await knex.schema.alterTable('project', (table) => {
    table.dropColumn('start_date');
    table.dropColumn('end_date');
  });
};
