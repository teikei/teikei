import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Products } from '../../db/types.ts'
import {
  createProductsService,
  type ProductsService
} from '../../domain/products.ts'

class AdminProductsController {
  products: ProductsService

  constructor(products: ProductsService) {
    this.products = products
  }

  find(params: Params) {
    return this.products.list(params.query ?? {})
  }

  get(id: Id) {
    return this.products.get(id)
  }

  create(data: Insertable<Products>) {
    return this.products.create(data)
  }

  patch(id: Id, data: Updateable<Products>) {
    return this.products.patch(id, data)
  }
}

export default (app: Application) => {
  app.use(
    '/admin/products',
    new AdminProductsController(createProductsService(app.get('kysely')))
  )
}
