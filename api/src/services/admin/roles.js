import createService from 'feathers-objection/lib/index'

import Role from '../../app/models/admin/roles'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'

export default app => {
  const service = createService({
    model: Role,
    paginate: {
      default: 50
    }
  })

  app.use('/admin/roles', service)
  app.service('/admin/roles').hooks({
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
