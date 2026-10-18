import type { Query } from '@feathersjs/feathers'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Badges } from '../db/types.ts'

export type BadgeRow = Selectable<Badges>

const QUERYABLE: (keyof Badges)[] = [
  'id',
  'name',
  'category',
  'country',
  'url',
  'logo'
]

export const createBadgesRepository = (db: Database) => ({
  findAll: (trx: Database = db) =>
    trx.selectFrom('badges').selectAll().execute(),

  find: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('badges').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx
      .selectFrom('badges')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst(),

  insert: (values: Insertable<Badges>, trx: Database = db) =>
    trx
      .insertInto('badges')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: Updateable<Badges>, trx: Database = db) =>
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
