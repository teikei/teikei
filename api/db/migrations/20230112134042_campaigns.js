exports.up = async (knex) => {
  await knex.schema.createTable('email_campaigns', (table) => {
    table.bigIncrements()
    table.string('name')
    table.string('template')
    table.string('status').defaultTo('CREATED')
    table.timestamps()
  })
  await knex.schema.createTable('email_messages', (table) => {
    table.bigIncrements()
    table.bigint('user_id')
    table.foreign('user_id').references('users_id')
    table.bigint('campaign_id')
    table.foreign('campaign_id').references('campaigns_id')
    table.string('status').defaultTo('PENDING')
    table.timestamp('sent_at')
  })
}

exports.down = async (knex) => {}
