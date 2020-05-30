exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('farms', (table) => {
      table.boolean('active').notNullable().defaultTo(true)
    }),
    knex.schema.table('depots', (table) => {
      table.boolean('active').notNullable().defaultTo(true)
    }),
    knex.schema.table('initiatives', (table) => {
      table.boolean('active').notNullable().defaultTo(true)
    }),
  ])

exports.down = (knex, Promise) => {}
