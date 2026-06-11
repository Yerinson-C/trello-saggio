exports.up = async (knex) => {
  // Add project_code (short sequential ID for tokens like SGG-PROY-102)
  await knex.schema.table('project', (table) => {
    table.integer('project_code').nullable();
  });

  // Backfill existing projects with sequential codes
  const projects = await knex('project').select('id').orderBy('created_at', 'asc');
  for (let i = 0; i < projects.length; i++) {
    await knex('project').where('id', projects[i].id).update({ project_code: i + 1 });
  }

  await knex.schema.table('project', (table) => {
    table.integer('project_code').notNullable().alter();
  });

  // Add activity_code (short sequential ID for tokens like ACT-450)
  await knex.schema.table('card', (table) => {
    table.integer('activity_code').nullable();
  });

  const cards = await knex('card').select('id').orderBy('created_at', 'asc');
  for (let i = 0; i < cards.length; i++) {
    await knex('card').where('id', cards[i].id).update({ activity_code: i + 1 });
  }

  // inbound_email table
  await knex.schema.createTable('inbound_email', (table) => {
    table.bigInteger('id').primary();
    table.bigInteger('project_id').references('id').inTable('project').onDelete('CASCADE');
    table.bigInteger('card_id').references('id').inTable('card').onDelete('SET NULL').nullable();
    table.string('message_id', 512).nullable();
    table.string('in_reply_to', 512).nullable();
    table.string('thread_id', 512).nullable();
    table.string('from_email', 256).notNullable();
    table.string('from_name', 256).nullable();
    table.text('subject').notNullable();
    table.text('body_text').nullable();
    table.text('body_html').nullable();
    table.string('token', 64).nullable();
    table.boolean('is_processed').notNullable().defaultTo(false);
    table.string('processed_as', 32).nullable(); // 'task' | 'comment' | 'evidence'
    table.bigInteger('processed_item_id').nullable();
    table.timestamp('received_at').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });

  // inbound_email_attachment table
  await knex.schema.createTable('inbound_email_attachment', (table) => {
    table.bigInteger('id').primary();
    table.bigInteger('inbound_email_id').references('id').inTable('inbound_email').onDelete('CASCADE');
    table.string('filename', 512).notNullable();
    table.string('content_type', 128).nullable();
    table.bigInteger('size').nullable();
    table.string('url', 1024).nullable();
    table.timestamps(true, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('inbound_email_attachment');
  await knex.schema.dropTableIfExists('inbound_email');
  await knex.schema.table('card', (table) => {
    table.dropColumn('activity_code');
  });
  await knex.schema.table('project', (table) => {
    table.dropColumn('project_code');
  });
};
