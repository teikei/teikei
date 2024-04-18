exports.up = async (knex) => {
  await knex.schema.table("users", (table) => {
    table.timestamp("last_login")
  })
}

exports.down = async (knex) => {}
