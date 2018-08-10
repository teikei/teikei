import createService from 'feathers-objection/lib/index'

import Depot from '../../models/admin/depots'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'

export default app => {
  const eager = '[ownerships, places]'
  const service = createService({
    model: Depot,
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/depots', service)
  app.service('/admin/depots').hooks({
    before: {
      all: [restrictToSuperAdmin],
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
      create: [relate(Depot, 'ownerships'), relate(Depot, 'places')],
      update: [],
      patch: [relate(Depot, 'ownerships'), relate(Depot, 'places')],
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
