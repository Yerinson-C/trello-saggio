exports.up = async (knex) => {
  await knex.schema.createTable('crm_lead', (table) => {
    table.bigInteger('id').primary();
    table.bigInteger('assigned_user_id').nullable().references('id').inTable('user_account').onDelete('SET NULL');
    table.string('company_name', 256).notNullable();
    table.string('contact_name', 256).nullable();
    table.string('contact_email', 256).nullable();
    table.string('contact_phone', 64).nullable();
    table.string('service_interest', 256).nullable();
    table.string('stage', 32).notNullable().defaultTo('prospecto');
    table.decimal('estimated_value', 12, 2).nullable();
    table.text('notes').nullable();
    table.timestamp('expected_close_date', { useTz: true }).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};
exports.down = async (knex) => { await knex.schema.dropTable('crm_lead'); };
