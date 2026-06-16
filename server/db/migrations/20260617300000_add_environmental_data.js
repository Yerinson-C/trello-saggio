exports.up = async (knex) => {
  await knex.schema.createTable('environmental_data', (table) => {
    table.bigInteger('id').primary();
    table.bigInteger('project_id').notNullable().references('id').inTable('project').onDelete('CASCADE');
    table.bigInteger('recorded_by_user_id').notNullable().references('id').inTable('user_account').onDelete('CASCADE');
    table.string('category', 64).notNullable();
    table.string('subcategory', 128).nullable();
    table.string('scope', 16).nullable();
    table.decimal('quantity', 14, 4).notNullable();
    table.string('unit', 32).notNullable();
    table.string('period', 64).nullable();
    table.text('source').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
  await knex.schema.createTable('emission_factor', (table) => {
    table.bigInteger('id').primary();
    table.string('name', 256).notNullable();
    table.string('category', 64).notNullable();
    table.string('subcategory', 128).nullable();
    table.string('scope', 16).nullable();
    table.string('unit_input', 32).notNullable();
    table.string('unit_output', 32).notNullable().defaultTo('kgCO2e');
    table.decimal('factor', 14, 6).notNullable();
    table.string('source', 256).nullable();
    table.string('country', 64).nullable();
    table.integer('year').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};
exports.down = async (knex) => {
  await knex.schema.dropTable('emission_factor');
  await knex.schema.dropTable('environmental_data');
};
