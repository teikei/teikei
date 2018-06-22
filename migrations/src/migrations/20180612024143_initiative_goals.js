exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('next_goals', table => {
      table.bigIncrements()
      table.string('name')
      table.unique(['name'])
    }),
    knex.schema.createTable('next_initiatives_goals', table => {
      table.bigIncrements()
      table.bigint('initiative_id')
      table.foreign('initiative_id').references('next_initiatives_id')
      table.bigint('goal_id')
      table.foreign('goal_id').references('next_goals')
      table.unique(['initiative_id', 'goal_id'])
    })
  ])
}

exports.down = function(knex, Promise) {}
