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
      table.boolean('isVerified')
      table.string('verifyToken')
      table.string('verifyShortToken')
      table.bigint('verifyExpires')
      table.json('verifyChanges')
      table.string('resetToken')
      table.string('resetShortToken')
      table.bigint('resetExpires')
      table.timestamps()
      table.unique(['email'])
    })
  ])
}

exports.down = function(knex, Promise) {}
