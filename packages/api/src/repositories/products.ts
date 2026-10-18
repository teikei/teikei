import type { Query } from '@feathersjs/feathers'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Products } from '../db/types.ts'

export type ProductRow = Selectable<Products>

const QUERYABLE: (keyof Products)[] = ['id', 'category', 'name']

export const createProductsRepository = (db: Database) => ({
  findAll: (trx: Database = db) =>
    trx.selectFrom('products').selectAll().execute(),

  find: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('products').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx
      .selectFrom('products')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst(),

  insert: (values: Insertable<Products>, trx: Database = db) =>
    trx
      .insertInto('products')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: Updateable<Products>, trx: Database = db) =>
    trx
      .updateTable('products')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
})
