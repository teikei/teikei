/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  // Drop all legacy tables in dependency order
  // Drop junction tables first, then main tables

  // Drop junction tables
  await knex.raw('DROP TABLE IF EXISTS legacy_goals_initiatives CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_users_roles CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_place_connections CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_ownerships CASCADE')

  // Drop main tables
  await knex.raw('DROP TABLE IF EXISTS legacy_goals CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_images CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_places CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_roles CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_users CASCADE')
  await knex.raw('DROP TABLE IF EXISTS legacy_versions CASCADE')

  // Drop schema migrations table last
  await knex.raw('DROP TABLE IF EXISTS legacy_schema_migrations CASCADE')
}

exports.down = async () => {
  // This migration cannot be reversed as we're dropping legacy data
  // that should no longer be needed
  throw new Error(
    'Cannot rollback legacy table cleanup - operation is irreversible'
  )
}
