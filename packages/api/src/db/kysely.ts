import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import type { DB } from './types.ts'

export type Database = Kysely<DB>

type PostgresConfig = {
  // The integration tests pass a function so the container's mapped port is
  // read after the container has started.
  connection: string | (() => string)
  kyselyPoolMax?: number
}

// Runs next to the knex pool until Objection is gone, so it stays small to
// keep the combined connection count within the Postgres limit.
const DEFAULT_POOL_MAX = 5

export const createKysely = ({
  connection,
  kyselyPoolMax = DEFAULT_POOL_MAX
}: PostgresConfig): Database =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString:
          typeof connection === 'function' ? connection() : connection,
        max: kyselyPoolMax
      })
    }),
    // Rows keep the camelCase keys knexSnakeCaseMappers produces today.
    plugins: [new CamelCasePlugin()]
  })
