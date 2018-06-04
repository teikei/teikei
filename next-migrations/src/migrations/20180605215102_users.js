exports.up = function(knex, Promise) {
  knex.schema.createTable('next_users', table => {
    table.bigIncrements()
    table.string('email')
    table.string('name')
    table.string('encrypted_password')
    table.string('origin')
    table.string('baseurl')
    table.string('phone')
    table.boolean('is_verified')
    table.string('verify_token')
    table.string('verify_short_token')
    table.date('verify_expires')
    // verifyChanges: // an object (key-value map), e.g. { field: "value" }
    table.string('reset_token')
    table.string('resetShortToken')
    table.date('reset_expires')
    table.timestamps()
    table.unique(['email'])
  })
}

exports.down = function(knex, Promise) {}
