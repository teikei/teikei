import createService from 'feathers-objection/lib/index'

import Depot from '../../app/models/admin/depots'
import { addFilteredTotal } from '../../hooks/admin'

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
