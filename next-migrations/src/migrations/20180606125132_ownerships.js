exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('next_depots_users', table => {
      table.bigIncrements()
      table.bigint('depot_id')
      table.foreign('depot_id').references('next_depots_id')
      table.bigint('user_id')
      table.foreign('user_id').references('next_users_id')
      table.unique(['depot_id', 'user_id'])
    }),
    knex.schema.createTable('next_farms_users', table => {
      table.bigIncrements()
      table.bigint('farm_id')
      table.foreign('farm_id').references('next_farms_id')
      table.bigint('user_id')
      table.foreign('user_id').references('next_users_id')
      table.unique(['farm_id', 'user_id'])
    }),
    knex.schema.createTable('next_initiatives_users', table => {
      table.bigIncrements()
      table.bigint('initiative_id')
      table.foreign('initiative_id').references('next_initiatives_id')
      table.bigint('user_id')
      table.foreign('user_id').references('next_users_id')
      table.unique(['initiative_id', 'user_id'])
    })
  ])
}

exports.down = function(knex, Promise) {}
