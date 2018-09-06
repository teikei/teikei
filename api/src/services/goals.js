import createService from 'feathers-objection'
import Goal from '../models/goals'
import filterAllowedFields from '../hooks/filterAllowedFields'

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
