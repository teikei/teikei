exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('depots_networks', table => {
      table.bigIncrements()
      table.bigint('depot_id')
      table.foreign('depot_id').references('depots_id')
      table.bigint('network_id')
      table.foreign('network_id').references('networks_id')
      table.unique(['network_id', 'depot_id'])
    })
  ])
}

exports.down = function(knex, Promise) {}
