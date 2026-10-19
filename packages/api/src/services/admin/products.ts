import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Database } from '../../db/kysely.ts'
import type { Products } from '../../db/types.ts'
import { createProductsDomain } from '../../domain/products.ts'

const createAdminProductsController = (db: Database) => {
  const products = createProductsDomain(db)

  return {
    find: (params: Params) => products.list(params.query ?? {}),
    get: (id: Id) => products.get(id),
    create: (data: Insertable<Products>) => products.create(data),
    patch: (id: Id, data: Updateable<Products>) => products.patch(id, data)
  }
}

export default (app: Application) => {
  app.use('/admin/products', createAdminProductsController(app.get('kysely')))
}
