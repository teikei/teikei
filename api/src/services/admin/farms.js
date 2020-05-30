import createService from 'feathers-objection'

import { FarmAdmin } from '../../models/farms'
import addFilteredTotal from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'
import refreshSearchIndex from '../../hooks/refreshSearchIndex'

export default (app) => {
  const eager = '[products, ownerships, badges, depots]'
  const service = createService({
    model: FarmAdmin,
    whitelist: ['$eager', '$ilike'],
    paginate: {
      default: 50,
    },
    allowedEager: eager,
  })

  app.use('/admin/farms', service)
  app.service('/admin/farms').hooks({
    before: {
      all: [],
      find: [withEager(eager)],
      get: [withEager(eager)],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: [],
    },
    after: {
      all: [refreshSearchIndex],
      find: [addFilteredTotal],
      get: [],
      create: [
        relate(FarmAdmin, 'products'),
        relate(FarmAdmin, 'badges'),
        relate(FarmAdmin, 'ownerships'),
        relate(FarmAdmin, 'depots'),
      ],
      update: [],
      patch: [
        relate(FarmAdmin, 'products'),
        relate(FarmAdmin, 'badges'),
        relate(FarmAdmin, 'ownerships'),
        relate(FarmAdmin, 'depots'),
      ],
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
