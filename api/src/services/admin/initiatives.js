import createService from 'feathers-objection/lib/index'

import Initiative from '../../app/models/admin/initiatives'
import { connectGoalsById, connectOwner, withEager } from '../../hooks/relations'

export default app => {
  const service = createService({
    model: Initiative,
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
      find: [],
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
