exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('farms_networks', table => {
      table.bigIncrements()
      table.bigint('farm_id')
      table.foreign('farm_id').references('farms_id')
      table.bigint('network_id')
      table.foreign('network_id').references('networks_id')
      table.unique(['network_id', 'farm_id'])
    })
  ])
}

exports.down = function(knex, Promise) {}
