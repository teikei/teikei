import knex from 'knex'
import config from './knexfile'

const teikei = knex(config)

console.log('resetting database')

const resetDatabase = async () => {
  await teikei.schema.raw(
    `
  drop table if exists knex_migrations;
  drop table if exists knex_migrations_lock;
  drop table if exists next_depots;
  drop table if exists next_depots_users;
  drop table if exists next_farms;
  drop table if exists next_farms_depots;
  drop table if exists next_farms_products;
  drop table if exists next_farms_users;
  drop table if exists next_goals;
  drop table if exists next_roles;
  drop table if exists next_initiatives;
  drop table if exists next_initiatives_goals;
  drop table if exists next_initiatives_users;
  drop table if exists next_products;
  drop table if exists next_users;
`
  )
  console.log('done.')

  teikei.destroy()
}

resetDatabase()
