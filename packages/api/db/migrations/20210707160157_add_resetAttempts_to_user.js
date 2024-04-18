exports.up = async (knex) => {
  await knex.schema.table("users", (table) => {
    table.integer("reset_attempts").nullable()
  })
}

exports.down = async (knex) => {}
