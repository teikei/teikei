exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('farms', (table) => {
      table.string('postalcode')
      table.string('street')
      table.string('housenumber')
    }),
    knex.schema.table('depots', (table) => {
      table.string('postalcode')
      table.string('street')
      table.string('housenumber')
    }),
    knex.schema.table('initiatives', (table) => {
      table.string('postalcode')
      table.string('street')
      table.string('housenumber')
    }),
  ])

exports.down = (knex, Promise) => {}
