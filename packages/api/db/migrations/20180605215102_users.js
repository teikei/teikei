exports.up = async (knex) => {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements()
    table.string("email")
    table.string("name")
    table.string("password")
    table.string("origin")
    table.string("baseurl")
    table.string("phone")
    table.boolean("is_verified")
    table.string("verify_token")
    table.string("verify_short_token")
    table.timestamp("verify_expires")
    table.json("verify_changes")
    table.string("reset_token")
    table.string("reset_short_token")
    table.timestamp("reset_expires")
    table.timestamps()
    table.unique(["email"])
  })
}

exports.down = async (knex) => {}
