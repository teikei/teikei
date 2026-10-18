import type { Selectable } from 'kysely'
import type { Database } from '../db/kysely.ts'
import type { Products } from '../db/types.ts'

export type ProductRow = Selectable<Products>

export const createProductsRepository = (db: Database) => ({
  findAll: (trx: Database = db) =>
    trx.selectFrom('products').selectAll().execute(),

  findById: (id: string, trx: Database = db) =>
    trx
      .selectFrom('products')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
})
