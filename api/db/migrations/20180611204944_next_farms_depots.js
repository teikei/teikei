exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('farms_depots', (table) => {
      table.bigIncrements()
      table.bigint('farm_id')
      table.foreign('farm_id').references('farms_id')
      table.bigint('depot_id')
      table.foreign('depot_id').references('depots_id')
      table.unique(['depot_id', 'farm_id'])
    }),
  ])
}

exports.down = function (knex, Promise) {}
