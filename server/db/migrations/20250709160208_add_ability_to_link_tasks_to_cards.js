/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

exports.up = async (knex) =>
  knex.schema.alterTable('task', (table) => {
    /* Columns */

    table.bigInteger('linked_card_id');

    /* Indexes */

    table.index('linked_card_id');
  });

exports.down = (knex) =>
  knex.schema.table('task', (table) => {
    table.dropColumn('linked_card_id');
  });
