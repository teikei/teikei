import type { Id, Query } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import { notFound, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import type { Products } from '../db/types.ts'
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

export const createProductsDomain = (db: Database) => {
  const products = createProductsRepository(db)

  const get = async (id: Id) => {
    const row = await withFeathersErrors(products.findById(String(id)))
    if (!row) {
      throw notFound(id)
    }
    return toProduct(row)
  }

  return {
    get,

    listAll: async () =>
      (await withFeathersErrors(products.findAll())).map(toProduct),

    list: async (query: Query) => {
      const page = await withFeathersErrors(products.find(query))
      return { ...page, data: page.data.map(toProduct) }
    },

    create: async (input: Insertable<Products>) =>
      toProduct(await withFeathersErrors(products.insert(input))),

    patch: async (id: Id, input: Updateable<Products>) => {
      // react-admin sends {} for an unchanged form; answer with the record.
      if (Object.keys(input).length === 0) {
        return get(id)
      }
      const row = await withFeathersErrors(products.update(String(id), input))
      if (!row) {
        throw notFound(id)
      }
      return toProduct(row)
    }
  }
}
