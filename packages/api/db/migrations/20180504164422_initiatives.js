exports.up = async (knex) => {
  await knex.schema.createTable("initiatives", (table) => {
    table.bigIncrements()
    table.integer("legacy_id")
    table.string("name")
    table.string("city")
    table.string("address")
    table.decimal("latitude", null)
    table.decimal("longitude", null)
    table.string("url")
    table.text("description")
    table.unique(["legacy_id"])
    table.timestamps()
  })
}

exports.down = async (knex) => {}
