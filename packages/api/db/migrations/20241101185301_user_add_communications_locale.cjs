exports.up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.string('locale').defaultTo('de-DE')
  })
  await knex.raw(`
    UPDATE users set locale = 'de-DE'
  `)
}

exports.down = async (knex) => {}
