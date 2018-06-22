import knex from 'knex'
import config from './knexfile'

const teikei = knex(config)

console.log('resetting database')

const resetDatabase = async () => {
  await teikei.schema.raw(`
    drop table if exists knex_migrations;
    drop table if exists knex_migrations_lock;
    drop table if exists depots;
    drop table if exists depots_users;
    drop table if exists farms;
    drop table if exists farms_depots;
    drop table if exists farms_products;
    drop table if exists farms_users;
    drop table if exists goals;
    drop table if exists roles;
    drop table if exists initiatives;
    drop table if exists initiatives_goals;
    drop table if exists initiatives_users;
    drop table if exists products;
    drop table if exists users;
    `)
  await Promise.all([
    teikei.schema.renameTable('legacy_goals', 'goals'),
    teikei.schema.renameTable('legacy_goals_initiatives', 'goals_initiatives'),
    teikei.schema.renameTable('legacy_images', 'images'),
    teikei.schema.renameTable('legacy_ownerships', 'ownerships'),
    teikei.schema.renameTable('legacy_place_connections', 'place_connections'),
    teikei.schema.renameTable('legacy_places', 'places'),
    teikei.schema.renameTable('legacy_roles', 'roles'),
    teikei.schema.renameTable('legacy_schema_migrations', 'schema_migrations'),
    teikei.schema.renameTable('legacy_users', 'users'),
    teikei.schema.renameTable('legacy_versions', 'versions')
  ])
  console.log('done.')

  teikei.destroy()
}

resetDatabase()
