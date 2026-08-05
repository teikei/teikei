export const up = async (knex) => {
  await knex.schema.createTable('products', (table) => {
    table.bigIncrements()
    table.string('category')
    table.string('name')
    table.unique(['category', 'name'])
  })
}

export const down = async (knex) => {}
