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

const toBadge = (row: BadgeRow): Badge => ({
  ...row,
  type: 'Badge',
  link: `/badges/${row.id}`
})

export const createBadgesService = (db: Database) => {
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

    listAll: async () =>
      (await withFeathersErrors(badges.findAll())).map(toBadge),

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

export type BadgesService = ReturnType<typeof createBadgesService>
