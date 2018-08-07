import createService from 'feathers-objection/lib/index'

import Initiative from '../../app/models/admin/initiatives'
import { connectGoalsById, connectOwner, withEager } from '../../hooks/relations'
import { addFilteredTotal } from '../../hooks/admin'

export default app => {
  const service = createService({
    model: Initiative,
    paginate: {
      default: 50,
      max: 100
    },
    allowedEager: '[goals, ownerships]'
  })

  app.use('/admin/initiatives', service)
  app.service('/admin/initiatives').hooks({
    before: {
      all: [],
      find: [withEager('[goals, ownerships]')],
      get: [withEager('[goals, ownerships]')],
      create: [],
      update: [],
      patch: [],
      remove: []
    },
    after: {
      all: [],
      find: [addFilteredTotal],
      get: [],
      create: [connectGoalsById, connectOwner],
      update: [],
      patch: [connectGoalsById],
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
