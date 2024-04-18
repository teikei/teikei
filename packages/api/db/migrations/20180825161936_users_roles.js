exports.up = async (knex) => {
  await knex.schema.createTable("users_roles", (table) => {
    table.bigIncrements()
    table.bigint("user_id")
    table.foreign("user_id").references("users_id")
    table.bigint("role_id")
    table.foreign("role_id").references("roles_id")
    table.unique(["role_id", "user_id"])
  })
}

exports.down = async (knex) => {}
