exports.up = async (knex) => {
  await knex.schema.createTable('deliverable', (table) => {
    table.bigInteger('id').primary();
    table.bigInteger('project_id').notNullable().references('id').inTable('project').onDelete('CASCADE');
    table.bigInteger('created_by_user_id').notNullable().references('id').inTable('user_account').onDelete('CASCADE');
    table.string('name', 256).notNullable();
    table.text('description').nullable();
    table.string('status', 32).notNullable().defaultTo('draft');
    table.timestamp('due_date', { useTz: true }).nullable();
    table.string('file_url', 1024).nullable();
    table.string('file_name', 256).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};
exports.down = async (knex) => { await knex.schema.dropTable('deliverable'); };
