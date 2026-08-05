export const up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.boolean('admin_email_notifications').notNullable().defaultTo(true)
  })
}

export const down = async (knex) => {}
