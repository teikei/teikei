export const up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.string('reactivation_token').nullable()
  })
}

export const down = async (knex) => {}
