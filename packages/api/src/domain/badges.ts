import { notFound } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createBadgesRepository,
  type BadgeChanges,
  type BadgeValues
} from '../repositories/badges.ts'

export const createBadgesDomain = (db: Database) => {
  const badges = createBadgesRepository(db)

  const get = async (id: string) => {
    const row = await badges.findById(id)
    if (!row) {
      throw notFound(id)
    }
    return row
  }

  return {
    get,

    listAll: (query: ListQuery) => badges.findAll(query),

    list: (query: ListQuery) => badges.find(query),

    create: (input: BadgeValues) => badges.insert(input),

    patch: async (id: string, input: BadgeChanges) => {
      // react-admin sends {} for an unchanged form; answer with the record.
      if (Object.keys(input).length === 0) {
        return get(id)
      }
      const row = await badges.update(id, input)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    remove: async (id: string) => {
      const row = await badges.delete(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    }
  }
}
