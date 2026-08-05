/**
 * Add the foreign key constraints that were never actually created.
 *
 * Every relation table declared its foreign keys with the broken form
 * `.references('users_id')` (bare underscore string, no `.inTable()` and no
 * `table.column` dot). knex interprets that as a column name with no target
 * table and silently emits NO constraint, so the database has enforced zero
 * referential integrity since 2018. This migration recreates every foreign
 * key correctly, adds `ON DELETE CASCADE`, and indexes the child columns that
 * are not already covered by the leading column of a composite unique index.
 *
 * Manually remove all orphaned rows first with scripts/cleanup-orphans.sql.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// column -> table.id. All child rows are dependent records, so ON DELETE CASCADE
// is the correct behaviour throughout (deleting a farm/user/campaign removes its
// join and message rows rather than leaving orphans).
const foreignKeys = [
  { table: 'farms_products', column: 'farm_id', refTable: 'farms' },
  { table: 'farms_products', column: 'product_id', refTable: 'products' },
  { table: 'depots_users', column: 'depot_id', refTable: 'depots' },
  { table: 'depots_users', column: 'user_id', refTable: 'users' },
  { table: 'farms_users', column: 'farm_id', refTable: 'farms' },
  { table: 'farms_users', column: 'user_id', refTable: 'users' },
  {
    table: 'initiatives_users',
    column: 'initiative_id',
    refTable: 'initiatives'
  },
  { table: 'initiatives_users', column: 'user_id', refTable: 'users' },
  { table: 'farms_depots', column: 'farm_id', refTable: 'farms' },
  { table: 'farms_depots', column: 'depot_id', refTable: 'depots' },
  {
    table: 'initiatives_goals',
    column: 'initiative_id',
    refTable: 'initiatives'
  },
  { table: 'initiatives_goals', column: 'goal_id', refTable: 'goals' },
  { table: 'users_roles', column: 'user_id', refTable: 'users' },
  { table: 'users_roles', column: 'role_id', refTable: 'roles' },
  { table: 'farms_badges', column: 'farm_id', refTable: 'farms' },
  { table: 'farms_badges', column: 'badge_id', refTable: 'badges' },
  {
    table: 'initiatives_badges',
    column: 'initiative_id',
    refTable: 'initiatives'
  },
  { table: 'initiatives_badges', column: 'badge_id', refTable: 'badges' },
  { table: 'email_messages', column: 'user_id', refTable: 'users' },
  {
    table: 'email_messages',
    column: 'campaign_id',
    refTable: 'email_campaigns'
  },
  { table: 'admins_origins', column: 'user_id', refTable: 'users' },
  { table: 'admins_origins', column: 'origin_id', refTable: 'origins' }
]

// FK child columns NOT already indexed by the leading column of a composite
// unique index (Postgres indexes the parent side automatically, but not the
// child side). email_messages has no unique index at all, so both columns need
// one.
const indexes = [
  { table: 'farms_products', column: 'product_id' },
  { table: 'depots_users', column: 'user_id' },
  { table: 'farms_users', column: 'user_id' },
  { table: 'initiatives_users', column: 'user_id' },
  { table: 'farms_depots', column: 'farm_id' },
  { table: 'initiatives_goals', column: 'goal_id' },
  { table: 'users_roles', column: 'user_id' },
  { table: 'farms_badges', column: 'badge_id' },
  { table: 'initiatives_badges', column: 'badge_id' },
  { table: 'email_messages', column: 'user_id' },
  { table: 'email_messages', column: 'campaign_id' },
  { table: 'admins_origins', column: 'user_id' }
]

const indexName = ({ table, column }) => `${table}_${column}_index`

export const up = async (knex) => {
  for (const index of indexes) {
    await knex.schema.alterTable(index.table, (t) => {
      t.index([index.column], indexName(index))
    })
  }
  for (const { table, column, refTable } of foreignKeys) {
    await knex.schema.alterTable(table, (t) => {
      t.foreign(column).references('id').inTable(refTable).onDelete('CASCADE')
    })
  }
}

export const down = async (knex) => {
  for (const { table, column } of foreignKeys) {
    await knex.schema.alterTable(table, (t) => {
      t.dropForeign([column])
    })
  }
  for (const index of indexes) {
    await knex.schema.alterTable(index.table, (t) => {
      t.dropIndex([index.column], indexName(index))
    })
  }
}
