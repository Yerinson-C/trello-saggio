exports.up = async (knex) => {
  await knex.schema.createTable('time_entry', (table) => {
    table.bigInteger('id').primary();
    table.bigInteger('project_id').notNullable().references('id').inTable('project').onDelete('CASCADE');
    table.bigInteger('user_id').notNullable().references('id').inTable('user_account').onDelete('CASCADE');
    table.bigInteger('card_id').nullable().references('id').inTable('card').onDelete('SET NULL');
    table.string('description', 512).nullable();
    table.decimal('hours', 5, 2).notNullable();
    table.date('entry_date').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};
exports.down = async (knex) => { await knex.schema.dropTable('time_entry'); };
