import type { Id, Query } from '@feathersjs/feathers'
import { notFound, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import {
  createOriginsRepository,
  type OriginRow
} from '../repositories/origins.ts'

export type Origin = OriginRow & { type: 'Origin'; link: string }

const toOrigin = (row: OriginRow): Origin => ({
  ...row,
  type: 'Origin',
  link: `/origins/${row.id}`
})

export const createOriginsDomain = (db: Database) => {
  const origins = createOriginsRepository(db)

  return {
    list: async (query: Query) => {
      const page = await withFeathersErrors(origins.find(query))
      return { ...page, data: page.data.map(toOrigin) }
    },

    get: async (id: Id) => {
      const row = await withFeathersErrors(origins.findById(String(id)))
      if (!row) {
        throw notFound(id)
      }
      return toOrigin(row)
    }
  }
}
