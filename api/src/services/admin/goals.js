import createService from 'feathers-objection/lib/index'

import Goal from '../../app/models/admin/goals'

export default app => {
  const service = createService({
    model: Goal
  })

  app.use('/admin/goals', service)
  app.service('/admin/goals').hooks({
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
