exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('next_farms', table => {
      table.bigIncrements()
      table.integer('legacy_id')
      table.string('name')
      table.string('city')
      table.string('address')
      table.string('latitude')
      table.string('longitude')
      table.string('url')
      table.string('accepts_new_members')
      table.text('description')
      table.integer('founded_at_year')
      table.integer('founded_at_month')
      table.integer('maximum_members')
      table.text('additional_product_information')
      table.text('participation')
      table.boolean('acts_ecological')
      table.text('economical_behavior')
      table.timestamps()
    })
  ])
}

exports.down = function(knex, Promise) {}
