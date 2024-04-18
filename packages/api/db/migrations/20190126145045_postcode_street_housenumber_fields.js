exports.up = async (knex) => {
  await knex.schema.table("farms", (table) => {
    table.string("postalcode")
    table.string("street")
    table.string("housenumber")
  })
  await knex.schema.table("depots", (table) => {
    table.string("postalcode")
    table.string("street")
    table.string("housenumber")
  })
  await knex.schema.table("initiatives", (table) => {
    table.string("postalcode")
    table.string("street")
    table.string("housenumber")
  })
}

exports.down = async (knex) => {}
