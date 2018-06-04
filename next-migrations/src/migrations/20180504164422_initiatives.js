exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('next_initiatives', table => {
      table.bigIncrements()
      table.integer('legacy_id')
      table.string('name')
      table.string('city')
      table.string('address')
      table.string('latitude')
      table.string('longitude')
      table.string('url')
      table.text('description')
      table.timestamps()
    })
  ])
}

exports.down = function(knex, Promise) {}
