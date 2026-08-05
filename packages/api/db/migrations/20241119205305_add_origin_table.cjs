exports.up = async (knex) => {
  await knex.schema.createTable('origins', (table) => {
    table.bigIncrements()
    table.string('origin')
    table.string('baseurl')
    table.string('origin_name')
    table.string('organization_name')
    table.string('organization_email')
  })
  await knex.schema.createTable('admins_origins', (table) => {
    table.bigIncrements()
    table.bigint('user_id')
    table.foreign('user_id').references('users_id')
    table.bigint('origin_id')
    table.foreign('origin_id').references('origins_id')
    table.unique(['origin_id', 'user_id'])
  })
}

exports.down = async (knex) => {}
