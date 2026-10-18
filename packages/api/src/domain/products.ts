import { NotFound } from '@feathersjs/errors'
import type { Id } from '@feathersjs/feathers'
import { withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import {
  createProductsRepository,
  type ProductRow
} from '../repositories/products.ts'

export type Product = ProductRow & { type: 'Product'; link: string }

const toProduct = (row: ProductRow): Product => ({
  ...row,
  type: 'Product',
  link: `/products/${row.id}`
})

export const createProductsService = (db: Database) => {
  const products = createProductsRepository(db)

  return {
    list: async () =>
      (await withFeathersErrors(products.findAll())).map(toProduct),

    get: async (id: Id) => {
      const row = await withFeathersErrors(products.findById(String(id)))
      if (!row) {
        throw new NotFound(`No record found for id '${id}'`)
      }
      return toProduct(row)
    }
  }
}

export type ProductsService = ReturnType<typeof createProductsService>
