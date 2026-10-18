import type { Selectable } from 'kysely'
import type { Database } from '../db/kysely.ts'
import type { Badges } from '../db/types.ts'

export type BadgeRow = Selectable<Badges>

export const createBadgesRepository = (db: Database) => ({
  findAll: (trx: Database = db) =>
    trx.selectFrom('badges').selectAll().execute(),

  findById: (id: string, trx: Database = db) =>
    trx.selectFrom('badges').selectAll().where('id', '=', id).executeTakeFirst()
})
