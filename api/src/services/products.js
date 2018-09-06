import createService from 'feathers-objection'
import Product from '../models/products'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = createService({
    model: Product
  })

  app.use('/products', service)
  app.service('products').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    after: {
      all: [filterAllowedFields],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
}
