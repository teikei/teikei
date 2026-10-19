import type { Query } from '@feathersjs/feathers'
import type { Selectable } from 'kysely'
import { findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Origins } from '../db/types.ts'

export type OriginRow = Selectable<Origins>

const QUERYABLE: (keyof Origins)[] = [
  'id',
  'origin',
  'baseurl',
  'originName',
  'organizationName',
  'organizationEmail'
]

export const createOriginsRepository = (db: Database) => ({
  find: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('origins').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx
      .selectFrom('origins')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
})
