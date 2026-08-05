export const up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.timestamp('last_login')
  })
}

export const down = async (knex) => {}
