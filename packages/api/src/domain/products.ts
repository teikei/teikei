import { notFound } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createProductsRepository,
  type ProductChanges,
  type ProductValues
} from '../repositories/products.ts'

export const createProductsDomain = (db: Database) => {
  const products = createProductsRepository(db)

  const get = async (id: string) => {
    const row = await products.findById(id)
    if (!row) {
      throw notFound(id)
    }
    return row
  }

  return {
    get,

    listAll: (query: ListQuery) => products.findAll(query),

    list: (query: ListQuery) => products.find(query),

    create: (input: ProductValues) => products.insert(input),

    patch: async (id: string, input: ProductChanges) => {
      // react-admin sends {} for an unchanged form; answer with the record.
      if (Object.keys(input).length === 0) {
        return get(id)
      }
      const row = await products.update(id, input)
      if (!row) {
        throw notFound(id)
      }
      return row
    }
  }
}
