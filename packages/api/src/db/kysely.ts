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

// The pg default. The API's only pool, so two processes overlapping during a
// deploy stay well within the Postgres connection limit.
const DEFAULT_POOL_MAX = 10

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
    // Rows keep the camelCase keys the Objection models had.
    plugins: [new CamelCasePlugin()]
  })
