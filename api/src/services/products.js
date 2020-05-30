import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common'
import Product from '../models/products'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default (app) => {
  const service = createService({
    model: Product,
  })

  app.use('/products', service)
  app
    .service('products')
    .hooks({
      before: {
        all: [],
        find: [],
        get: [],
        create: [disallow('external')],
        update: [disallow()],
        patch: [disallow('external')],
        remove: [disallow('external')],
      },
      after: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: [],
      },
      error: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: [],
      },
    })
    .hooks({
      after: {
        all: [filterAllowedFields],
      },
    })
}
