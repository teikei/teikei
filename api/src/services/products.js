import createService from 'feathers-objection'
import Product from '../models/products'

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
      all: [],
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
