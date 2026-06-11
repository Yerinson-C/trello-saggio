/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('comment', (table) => {
    table.bigInteger('parent_comment_id').nullable();
    table.foreign('parent_comment_id').references('id').inTable('comment').onDelete('CASCADE');
    table.index('parent_comment_id');
  });

  await knex.schema.alterTable('attachment', (table) => {
    table.bigInteger('comment_id').nullable();
    table.foreign('comment_id').references('id').inTable('comment').onDelete('CASCADE');
    table.index('comment_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('attachment', (table) => {
    table.dropForeign('comment_id');
    table.dropColumn('comment_id');
  });

  await knex.schema.alterTable('comment', (table) => {
    table.dropForeign('parent_comment_id');
    table.dropColumn('parent_comment_id');
  });
};
