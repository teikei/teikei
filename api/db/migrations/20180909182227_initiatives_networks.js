exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('initiatives_networks', table => {
      table.bigIncrements()
      table.bigint('initiative_id')
      table.foreign('initiative_id').references('initiatives_id')
      table.bigint('network_id')
      table.foreign('network_id').references('networks_id')
      table.unique(['network_id', 'initiative_id'])
    })
  ])
}

exports.down = function(knex, Promise) {}
