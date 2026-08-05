export const up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.integer('reset_attempts').nullable()
  })
}

export const down = async (knex) => {}
