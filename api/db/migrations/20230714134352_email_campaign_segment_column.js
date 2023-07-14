exports.up = async (knex) => {
  await knex.schema.table('email_campaigns', (table) => {
    table.string('segment').defaultTo('ALL')
  })
  await knex.raw(`
    UPDATE email_campaigns set segment = 'ALL'
  `)
}

exports.down = async (knex) => {}
