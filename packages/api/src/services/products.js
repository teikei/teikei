import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common'
import Product from '../models/products'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default (app) => {
  const service = createService({
    model: Product,
  })

  app.use('/products', service)
  app.service('products').hooks({
    before: {
      find: [],
      get: [],
      create: [disallow('external')],
      update: [disallow()],
      patch: [disallow('external')],
      remove: [disallow('external')],
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields],
    },
  })
}
