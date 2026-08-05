export const up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.string('locale').defaultTo('de-DE')
  })
  await knex.raw(`
    UPDATE users set locale = 'de-DE'
  `)
}

export const down = async (knex) => {}
