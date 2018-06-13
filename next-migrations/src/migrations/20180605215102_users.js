exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('next_users', table => {
      table.bigIncrements()
      table.string('email')
      table.string('name')
      table.string('password')
      table.string('origin')
      table.string('baseurl')
      table.string('phone')
      table.boolean('is_verified')
      table.string('verify_token')
      table.date('verify_expires')
      table.string('verify_changes')
      table.string('reset_token')
      table.date('reset_expires')
      table.timestamps()
      table.unique(['email'])
    })
  ])
}

exports.down = function(knex, Promise) {}
