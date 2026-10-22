import { sql } from 'kysely'
import type { Database } from '../db/kysely.ts'

// pg returns count(*) as a string, which the admin dashboard reads as it is.
type Count = { count: string }

export const createStatsRepository = (db: Database) => ({
  countEntries: async (
    table: 'farms' | 'depots' | 'initiatives',
    trx: Database = db
  ) =>
    (await sql<Count>`select count(*) from ${sql.table(table)}`.execute(trx))
      .rows[0],

  countUsersByState: async (trx: Database = db) =>
    (
      await sql<
        Count & { state: string | null }
      >`select state, count(*) from users group by state`.execute(trx)
    ).rows
})
