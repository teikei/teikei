
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('networks', table => {
      table.bigIncrements()
      table.string('name')
      table.unique(['name'])
    })
  ])
};

exports.down = function(knex, Promise) {

};
