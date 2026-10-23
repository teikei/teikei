import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createProductsDomain } from '../domain/products.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import { toProduct } from './serializers.ts'

const createProductsController = (db: Database) => {
  const products = createProductsDomain(db)

  return {
    find: async (params: Params) =>
      (await products.listAll(params.query ?? {})).map(toProduct),
    get: async (id: Id) => toProduct(await products.get(String(id)))
  }
}

export default (app: Application) => {
  app.use('/products', createProductsController(app.get('kysely')))
  app.service('products').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    },
    error: { all: [mapDatabaseErrors] }
  })
}
