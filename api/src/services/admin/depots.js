import createService from 'feathers-objection/lib/index'
import { hooks as authHooks } from '@feathersjs/authentication'

import Depot from '../../app/models/admin/depots'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'
import { iff, isProvider } from 'feathers-hooks-common/lib/index'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'

export default app => {
  const service = createService({
    model: Depot,
    paginate: {
      default: 50,
      max: 100
    }
  })

  app.use('/admin/depots', service)
  app.service('/admin/depots').hooks({
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
