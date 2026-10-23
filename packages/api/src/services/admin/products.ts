import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createProductsDomain } from '../../domain/products.ts'
import type {
  ProductChanges,
  ProductValues
} from '../../repositories/products.ts'
import { fromRequest, toPage, toProduct } from '../serializers.ts'

const createAdminProductsController = (db: Database) => {
  const products = createProductsDomain(db)

  return {
    find: async (params: Params) =>
      toPage(await products.list(params.query ?? {}), toProduct),
    get: async (id: Id) => toProduct(await products.get(String(id))),
    create: async (data: ProductValues) =>
      toProduct(await products.create(fromRequest(data))),
    patch: async (id: Id, data: ProductChanges) =>
      toProduct(await products.patch(String(id), fromRequest(data)))
  }
}

export default (app: Application) => {
  app.use('/admin/products', createAdminProductsController(app.get('kysely')))
  app.service('admin/products').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
