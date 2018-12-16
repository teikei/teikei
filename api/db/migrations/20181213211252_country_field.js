exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('farms', table => {
      table.string('country')
      table.string('state')
    }),
    knex.schema.table('depots', table => {
      table.string('country')
      table.string('state')
    }),
    knex.schema.table('initiatives', table => {
      table.string('country')
      table.string('state')
    })
  ])

exports.down = (knex, Promise) => {}
