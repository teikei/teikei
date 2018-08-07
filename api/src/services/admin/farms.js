import createService from 'feathers-objection/lib/index'
import { hooks as authHooks } from '@feathersjs/authentication'

import Farm from '../../app/models/admin/farms'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'

export default app => {
  const service = createService({
    model: Farm,
    paginate: {
      default: 50,
      max: 100
    }
  })

  app.use('/admin/farms', service)
  app.service('/admin/farms').hooks({
    before: {
      all: [authHooks.authenticate('jwt'), restrictToSuperAdmin],
      find: [],
      get: [],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
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
