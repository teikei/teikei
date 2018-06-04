module.exports = {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'teikei',
    password: 'teikei',
    database: 'teikei_next',
    port: 5432
  }
  // TODO: creating the migration tables in the 'next schema
  // is currently broken in knex and will be fixed with the
  // next version of knex.
  // migrations: {
  //   tableName: 'next.knex_migrations'
  // }
}
