import createService from 'feathers-objection/lib/index'

import User from '../../app/models/admin/users'

export default app => {
  const service = createService({
    model: User
  })

  app.use('/admin/users', service)
  app.service('/admin/users').hooks({
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
