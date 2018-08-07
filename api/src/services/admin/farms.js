import createService from 'feathers-objection/lib/index'

import Farm from '../../app/models/admin/farms'
import { addFilteredTotal } from '../../hooks/admin'

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
