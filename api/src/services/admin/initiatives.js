import createService from 'feathers-objection/lib/index'

import Initiative from '../../models/admin/initiatives'
import { relate, withEager } from '../../hooks/relations'
import { addFilteredTotal } from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'

export default app => {
  const eager = '[goals, ownerships]'
  const service = createService({
    model: Initiative,
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/initiatives', service)
  app.service('/admin/initiatives').hooks({
    before: {
      all: [],
      find: [withEager(eager)],
      get: [withEager(eager)],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: []
    },
    after: {
      all: [],
      find: [addFilteredTotal],
      get: [],
      create: [relate(Initiative, 'goals'), relate(Initiative, 'ownerships')],
      update: [],
      patch: [relate(Initiative, 'goals'), relate(Initiative, 'ownerships')],
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
