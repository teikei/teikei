import createService from 'feathers-objection'

import { DepotAdmin } from '../../models/depots'
import {
  addFilteredTotal,
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'
import refreshSearchIndex from '../../hooks/refreshSearchIndex'

export default (app) => {
  const eager = '[ownerships, farms]'
  const service = createService({
    model: DepotAdmin,
    whitelist: ['$eager', '$ilike'],
    paginate: {
      default: 50,
    },
    allowedEager: eager,
  })

  app.use('/admin/depots', service)
  app.service('/admin/depots').hooks({
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
      find: [
        addFilteredTotal,
        mapResultListRelationsToIds(eager),
      ],
      get: [mapResultRelationsToIds(eager)],
      create: [relate(DepotAdmin, 'ownerships'), relate(DepotAdmin, 'farms')],
      update: [],
      patch: [relate(DepotAdmin, 'ownerships'), relate(DepotAdmin, 'farms')],
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
