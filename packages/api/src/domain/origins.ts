import { notFound } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import { createOriginsRepository } from '../repositories/origins.ts'

export const createOriginsDomain = (db: Database) => {
  const origins = createOriginsRepository(db)

  return {
    list: (query: ListQuery) => origins.find(query),

    get: async (id: string) => {
      const row = await origins.findById(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    }
  }
}
