exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('next_farms_products', table => {
      table.bigIncrements()
      table.bigint('farm_id')
      table.foreign('farm_id').references('next_entries_id')
      table.bigint('product_id')
      table.unique(['farm_id', 'product_id'])
      table.timestamps()
    })
  ])
}

exports.down = function(knex, Promise) {}
