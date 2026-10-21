import type { Query } from '@feathersjs/feathers'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { findMatching, findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Badges } from '../db/types.ts'

export type BadgeRow = Selectable<Badges>
export type BadgeValues = Insertable<Badges>
export type BadgeChanges = Updateable<Badges>

const QUERYABLE: (keyof Badges)[] = [
  'id',
  'name',
  'category',
  'country',
  'url',
  'logo'
]

export const createBadgesRepository = (db: Database) => ({
  findAll: (query: Query, trx: Database = db) =>
    findMatching(trx.selectFrom('badges').selectAll(), query, QUERYABLE),

  find: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('badges').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx
      .selectFrom('badges')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst(),

  insert: (values: BadgeValues, trx: Database = db) =>
    trx
      .insertInto('badges')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: BadgeChanges, trx: Database = db) =>
    trx
      .updateTable('badges')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  delete: (id: string, trx: Database = db) =>
    trx
      .deleteFrom('badges')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
})
