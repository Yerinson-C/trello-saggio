exports.up = async (knex) => {
  await knex.schema.table('project', (table) => {
    table.string('client_name', 256).nullable();
    table.string('service_type', 256).nullable();
    table.text('service_description').nullable();
    table.text('scope').nullable();
    table.text('objectives').nullable();
    table.string('project_status', 32).notNullable().defaultTo('on_track');
  });

  await knex.schema.table('card', (table) => {
    table.string('priority', 16).notNullable().defaultTo('normal');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('project', (table) => {
    table.dropColumn('client_name');
    table.dropColumn('service_type');
    table.dropColumn('service_description');
    table.dropColumn('scope');
    table.dropColumn('objectives');
    table.dropColumn('project_status');
  });

  await knex.schema.table('card', (table) => {
    table.dropColumn('priority');
  });
};
