import createService from 'feathers-objection'

import Role from '../../models/roles'
import addFilteredTotal from '../../hooks/admin'

export default (app) => {
  const service = createService({
    model: Role,
    whitelist: ['$ilike'],
    paginate: {
      default: 50,
    },
  })

  app.use('/admin/roles', service)
  app.service('/admin/roles').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    after: {
      all: [],
      find: [addFilteredTotal],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  })
}
