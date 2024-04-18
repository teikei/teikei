exports.up = async (knex) => {
  await knex.schema.createTable('roles', (table) => {
    table.bigIncrements()
    table.string('name')
    table.unique(['name'])
  })
}

exports.down = async (knex) => {}
