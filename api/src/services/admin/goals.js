import createService from 'feathers-objection/lib/index'

import Goal from '../../models/admin/goals'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'

export default app => {
  const service = createService({
    model: Goal,
    paginate: {
      default: 50
    }
  })

  app.use('/admin/goals', service)
  app.service('/admin/goals').hooks({
    before: {
      all: [restrictToSuperAdmin],
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
