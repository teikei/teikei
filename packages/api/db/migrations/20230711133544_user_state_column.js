exports.up = async (knex) => {
  await knex.schema.table("users", (table) => {
    table.string("state").defaultTo("ACTIVE")
    table.timestamp("reminder_sent_at")
    table.timestamp("second_reminder_sent_at")
    table.string("bounce_type")
    table.string("bounce_name")
  })
  await knex.raw(`
    UPDATE users set state = 'ACTIVE'
  `)
}

exports.down = async (knex) => {}
