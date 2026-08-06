export const up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.boolean('active').defaultTo(true)
  })
  await knex.raw(`
    UPDATE users set active = true
  `)
}

export const down = async (knex) => {}
