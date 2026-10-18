import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Products } from '../../db/types.ts'
import {
  createProductsDomain,
  type ProductsDomain
} from '../../domain/products.ts'

const createAdminProductsController = (products: ProductsDomain) => ({
  find: (params: Params) => products.list(params.query ?? {}),
  get: (id: Id) => products.get(id),
  create: (data: Insertable<Products>) => products.create(data),
  patch: (id: Id, data: Updateable<Products>) => products.patch(id, data)
})

export default (app: Application) => {
  app.use(
    '/admin/products',
    createAdminProductsController(createProductsDomain(app.get('kysely')))
  )
}
