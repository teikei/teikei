exports.up = async (knex) => {
  await knex.schema.table("farms", (table) => {
    table.boolean("active").notNullable().defaultTo(true)
  })
  await knex.schema.table("depots", (table) => {
    table.boolean("active").notNullable().defaultTo(true)
  })
  await knex.schema.table("initiatives", (table) => {
    table.boolean("active").notNullable().defaultTo(true)
  })
}

exports.down = async (knex) => {}
