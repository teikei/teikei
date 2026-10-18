import type { Application, Id } from '@feathersjs/feathers'
import type { Database } from '../db/kysely.ts'
import { createProductsDomain } from '../domain/products.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

const createProductsController = (db: Database) => {
  const products = createProductsDomain(db)

  return {
    find: () => products.listAll(),
    get: (id: Id) => products.get(id)
  }
}

export default (app: Application) => {
  app.use('/products', createProductsController(app.get('kysely')))
  app.service('products').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
