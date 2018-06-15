import knex from 'knex'
import config from './knexfile'

const teikei = knex(config)

console.log('resetting database')

const resetDatabase = async () => {
  await teikei.schema.raw(
    `
  drop table knex_migrations;
  drop table knex_migrations_lock;
  drop table next_depots;
  drop table next_depots_users;
  drop table next_farms;
  drop table next_farms_depots;
  drop table next_farms_products;
  drop table next_farms_users;
  drop table next_goals;
  drop table next_initiatives;
  drop table next_initiatives_goals;
  drop table next_initiatives_users;
  drop table next_products;
  drop table next_users;
`
  )
  console.log('done.')

  teikei.destroy()
}

resetDatabase()
