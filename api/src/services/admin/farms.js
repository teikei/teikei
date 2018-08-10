import createService from 'feathers-objection/lib/index'
import { hooks as authHooks } from '@feathersjs/authentication'

import Farm from '../../models/admin/farms'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'

export default app => {
  const eager = '[products, ownerships, places]'
  const service = createService({
    model: Farm,
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/farms', service)
  app.service('/admin/farms').hooks({
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
      create: [relate(Farm, 'products'), relate(Farm, 'ownerships'), relate(Farm, 'places')],
      update: [],
      patch: [relate(Farm, 'products'),  relate(Farm, 'ownerships'), relate(Farm, 'places')],
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
