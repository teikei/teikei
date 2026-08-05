export const up = async (knex) => {
  await knex.schema.createTable('roles', (table) => {
    table.bigIncrements()
    table.string('name')
    table.unique(['name'])
  })
}

export const down = async (knex) => {}
