exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', table => {
      table.bigIncrements()
      table.string('email')
      table.string('name')
      table.string('password')
      table.string('origin')
      table.string('baseurl')
      table.string('phone')
      table.boolean('isVerified')
      table.string('verifyToken')
      table.string('verifyShortToken')
      table.timestamp('verifyExpires')
      table.json('verifyChanges')
      table.string('resetToken')
      table.string('resetShortToken')
      table.timestamp('resetExpires')
      table.timestamps()
      table.unique(['email'])
    })
  ])
}

exports.down = function(knex, Promise) {}
