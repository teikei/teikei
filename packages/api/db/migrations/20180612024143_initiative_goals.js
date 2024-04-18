exports.up = async (knex) => {
  await knex.schema.createTable("goals", (table) => {
    table.bigIncrements()
    table.string("name")
    table.unique(["name"])
  })
  await knex.schema.createTable("initiatives_goals", (table) => {
    table.bigIncrements()
    table.bigint("initiative_id")
    table.foreign("initiative_id").references("initiatives_id")
    table.bigint("goal_id")
    table.foreign("goal_id").references("goals")
    table.unique(["initiative_id", "goal_id"])
  })
}

exports.down = async (knex) => {}
