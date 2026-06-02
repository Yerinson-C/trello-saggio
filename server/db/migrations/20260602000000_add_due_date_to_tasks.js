exports.up = async (knex) => {
  await knex.schema.table('task', (table) => {
    table.timestamp('due_date', { useTz: true }).nullable().defaultTo(null);
  });
};

exports.down = async (knex) => {
  await knex.schema.table('task', (table) => {
    table.dropColumn('due_date');
  });
};
