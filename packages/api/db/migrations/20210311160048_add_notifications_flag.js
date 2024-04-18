exports.up = async (knex) => {
  await knex.schema.table("users", (table) => {
    table.boolean("admin_email_notifications").notNullable().defaultTo(true)
  })
}

exports.down = async (knex) => {}
