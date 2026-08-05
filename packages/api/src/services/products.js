import { disallow } from 'feathers-hooks-common'
import createService from 'feathers-objection'
import filterAllowedFields from '../hooks/filterAllowedFields'
import Product from '../models/products'

export default (app) => {
  const service = createService({
    model: Product
  })

  app.use('/products', service)
  app.service('products').hooks({
    before: {
      create: [disallow('external')],
      update: [disallow()],
      patch: [disallow('external')],
      remove: [disallow('external')]
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields]
    }
  })
}
