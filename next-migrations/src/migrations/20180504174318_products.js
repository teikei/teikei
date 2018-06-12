exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('next_products', table => {
      table.bigIncrements()
      table.string('category')
      table.string('name')
      table.unique(['category', 'name'])
    })
  ])
}

exports.down = function(knex, Promise) {}
