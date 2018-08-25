import createService from 'feathers-objection'
import Goal from '../models/goals'

export default app => {
  const service = createService({
    model: Goal
  })

  app.use('/goals', service)
  app.service('goals').hooks({
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
