exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('depots', table => {
      table.bigIncrements()
      table.integer('legacy_id')
      table.string('name')
      table.string('city')
      table.string('address')
      table.decimal('latitude', null)
      table.decimal('longitude', null)
      table.string('url')
      table.text('description')
      table.string('delivery_days')
      table.unique(['legacy_id'])
      table.timestamps()
    })
  ])
}

exports.down = function(knex, Promise) {}
