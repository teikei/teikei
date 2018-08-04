import createService from 'feathers-objection/lib/index'

import Farm from '../../app/models/admin/farms'

export default app => {
  const service = createService({
    model: Farm
  })

  app.use('/admin/farms', service)
  app.service('/admin/farms').hooks({
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
