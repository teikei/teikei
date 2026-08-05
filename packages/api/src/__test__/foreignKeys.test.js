import { Model } from 'objection'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../db/integrationTestSetup.js'
import appLauncher from '../app.js'

// Guardrail against the class of bug fixed in the
// 20260701120000_add_missing_foreign_keys migration: knex silently emits NO
// constraint for a malformed `.references('users_id')` (bare underscore string,
// no `.inTable()` / no `table.column` dot), so a broken foreign key declaration
// never raises an error and goes unnoticed. This test reads the foreign keys
// that actually exist in the migrated schema and fails if any expected one is
// missing.

// Every relation column that must have a foreign key. Keep in sync with
// db/migrations/20260701120000_add_missing_foreign_keys.js and
// scripts/audit-foreign-keys.js.
const expectedForeignKeys = [
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

const key = ({ table, column, refTable }) =>
  `${table}.${column} -> ${refTable}.id`

describe('schema foreign keys', () => {
  let knex

  beforeAll(async () => {
    await setupIntegrationTestDb()
    appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString
      }
    })
    knex = Model.knex()
  })

  afterAll(async () => {
    await truncateTestDb()
  })

  const readForeignKeys = async () => {
    // Single-column foreign keys only (all of ours are), so joining through
    // key_column_usage / constraint_column_usage is unambiguous. Aliases have no
    // underscores so knexSnakeCaseMappers leaves the result keys untouched.
    const { rows } = await knex.raw(`
      select
        tc.table_name  as t,
        kcu.column_name as c,
        ccu.table_name  as rt
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on kcu.constraint_name = tc.constraint_name
       and kcu.table_schema = tc.table_schema
      join information_schema.constraint_column_usage ccu
        on ccu.constraint_name = tc.constraint_name
       and ccu.table_schema = tc.table_schema
      where tc.constraint_type = 'FOREIGN KEY'
        and tc.table_schema = 'public'
    `)
    return new Set(rows.map((r) => `${r.t}.${r.c} -> ${r.rt}.id`))
  }

  it('has every expected foreign key constraint', async () => {
    const actual = await readForeignKeys()
    const missing = expectedForeignKeys.map(key).filter((fk) => !actual.has(fk))
    expect(missing).toEqual([])
  })

  it('enforces referential integrity (rejects a dangling reference)', async () => {
    // farms_users.user_id references users.id; a non-existent user must be
    // rejected. Before the fix this insert succeeded silently.
    await expect(
      knex('farms_users').insert({ farm_id: null, user_id: 999999999 })
    ).rejects.toThrow()
  })
})
