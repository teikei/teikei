import type { Id, Query } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import { notFound, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import type { Badges } from '../db/types.ts'
import {
  createBadgesRepository,
  type BadgeRow
} from '../repositories/badges.ts'

export type Badge = BadgeRow & { type: 'Badge'; link: string }

// Generic over the row so entries can nest their column subsets.
export const toBadge = <R extends Pick<BadgeRow, 'id'>>(
  row: R
): R & { type: 'Badge'; link: string } => ({
  ...row,
  type: 'Badge',
  link: `/badges/${row.id}`
})

export const createBadgesDomain = (db: Database) => {
  const badges = createBadgesRepository(db)

  const get = async (id: Id) => {
    const row = await withFeathersErrors(badges.findById(String(id)))
    if (!row) {
      throw notFound(id)
    }
    return toBadge(row)
  }

  return {
    get,

    listAll: async (query: Query) =>
      (await withFeathersErrors(badges.findAll(query))).map(toBadge),

    list: async (query: Query) => {
      const page = await withFeathersErrors(badges.find(query))
      return { ...page, data: page.data.map(toBadge) }
    },

    create: async (input: Insertable<Badges>) =>
      toBadge(await withFeathersErrors(badges.insert(input))),

    patch: async (id: Id, input: Updateable<Badges>) => {
      // react-admin sends {} for an unchanged form; answer with the record.
      if (Object.keys(input).length === 0) {
        return get(id)
      }
      const row = await withFeathersErrors(badges.update(String(id), input))
      if (!row) {
        throw notFound(id)
      }
      return toBadge(row)
    },

    remove: async (id: Id) => {
      const row = await withFeathersErrors(badges.delete(String(id)))
      if (!row) {
        throw notFound(id)
      }
      return toBadge(row)
    }
  }
}
