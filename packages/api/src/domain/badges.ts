import { NotFound } from '@feathersjs/errors'
import type { Id } from '@feathersjs/feathers'
import { withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
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

  return {
    list: async () => (await withFeathersErrors(badges.findAll())).map(toBadge),

    get: async (id: Id) => {
      const row = await withFeathersErrors(badges.findById(String(id)))
      if (!row) {
        throw new NotFound(`No record found for id '${id}'`)
      }
      return toBadge(row)
    }
  }
}

export type BadgesService = ReturnType<typeof createBadgesService>
