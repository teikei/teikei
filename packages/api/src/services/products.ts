import type { Application, Id } from '@feathersjs/feathers'
import {
  createProductsService,
  type ProductsService
} from '../domain/products.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

class ProductsController {
  products: ProductsService

  constructor(products: ProductsService) {
    this.products = products
  }

  find() {
    return this.products.listAll()
  }

  get(id: Id) {
    return this.products.get(id)
  }
}

export default (app: Application) => {
  app.use(
    '/products',
    new ProductsController(createProductsService(app.get('kysely')))
  )
  app.service('products').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
