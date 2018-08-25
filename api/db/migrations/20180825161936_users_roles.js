
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users_roles', table => {
      table.bigIncrements()
      table.bigint('user_id')
      table.foreign('user_id').references('users_id')
      table.bigint('role_id')
      table.foreign('role_id').references('roles_id')
      table.unique(['role_id', 'user_id'])
    })
  ])

};

exports.down = function(knex, Promise) {

};
