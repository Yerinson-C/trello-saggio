exports.up = async (knex) => {
  await knex.schema.table('task', (table) => {
    table.string('status', 32).notNullable().defaultTo('not_started');
  });

  await knex('task').where('is_completed', true).update({ status: 'completed' });

  await knex.schema.table('task', (table) => {
    table.dropColumn('is_completed');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('task', (table) => {
    table.boolean('is_completed').notNullable().defaultTo(false);
  });

  await knex('task').where('status', 'completed').update({ is_completed: true });

  await knex.schema.table('task', (table) => {
    table.dropColumn('status');
  });
};
