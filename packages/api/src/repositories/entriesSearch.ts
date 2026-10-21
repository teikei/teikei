import { sql } from 'kysely'
import type { Database } from '../db/kysely.ts'

export const createEntriesSearchRepository = (db: Database) => ({
  // The five best matches for a to_tsquery term, such as 'beispiel:* & farm:*'.
  findMatches: (searchTerm: string, trx: Database = db) =>
    trx
      .selectFrom('entriesSearch')
      .select(['name as title', 'id', 'type'])
      .where(sql<boolean>`search @@ to_tsquery(${searchTerm})`)
      .orderBy(sql`ts_rank(search, to_tsquery(${searchTerm}))`, 'desc')
      .limit(5)
      .execute(),

  // Concurrently, so searches keep reading the old index meanwhile.
  refresh: async (trx: Database = db) => {
    await sql`refresh materialized view concurrently entries_search`.execute(
      trx
    )
  }
})
