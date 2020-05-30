exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.createTable('badges', (table) => {
      table.bigIncrements()
      table.string('name')
      table.string('category')
      table.string('url')
      table.string('country')
      table.string('logo')
    }),
    knex.schema.createTable('farms_badges', (table) => {
      table.bigIncrements()
      table.bigint('badge_id')
      table.foreign('badge_id').references('badges_id')
      table.bigint('farm_id')
      table.foreign('farm_id').references('farms_id')
      table.unique(['farm_id', 'badge_id'])
    }),
  ])

exports.down = () => {}
