exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.renameTable('goals', 'legacy_goals'),
    knex.schema.renameTable('goals_initiatives', 'legacy_goals_initiatives'),
    knex.schema.renameTable('images', 'legacy_images'),
    knex.schema.renameTable('ownerships', 'legacy_ownerships'),
    knex.schema.renameTable('place_connections', 'legacy_place_connections'),
    knex.schema.renameTable('places', 'legacy_places'),
    knex.schema.renameTable('roles', 'legacy_roles'),
    knex.schema.renameTable('users_roles', 'legacy_users_roles'),
    knex.schema.renameTable('schema_migrations', 'legacy_schema_migrations'),
    knex.schema.renameTable('users', 'legacy_users'),
    knex.schema.renameTable('versions', 'legacy_versions')
  ])
}

exports.down = function(knex, Promise) {}
