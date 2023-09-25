import createService from 'feathers-objection'

import Product from '../../models/products'

export default (app) => {
  const service = createService({
    model: Product,
    whitelist: ['$eager', '$ilike'],
    paginate: {
      default: 50,
    },
  })

  app.use('/admin/products', service)
  app.service('/admin/products').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  })
}
