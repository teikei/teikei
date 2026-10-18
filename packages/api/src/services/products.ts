import type { Application, Id } from '@feathersjs/feathers'
import {
  createProductsDomain,
  type ProductsDomain
} from '../domain/products.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

const createProductsController = (products: ProductsDomain) => ({
  find: () => products.listAll(),
  get: (id: Id) => products.get(id)
})

export default (app: Application) => {
  app.use(
    '/products',
    createProductsController(createProductsDomain(app.get('kysely')))
  )
  app.service('products').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
