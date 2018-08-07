import createService from 'feathers-objection/lib/index'

import User from '../../app/models/admin/users'
import { addFilteredTotal } from '../../hooks/admin'

export default app => {
  const service = createService({
    model: User,
    paginate: {
      default: 50,
      max: 100
    }
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
      find: [addFilteredTotal],
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
