import createService from 'feathers-objection'

import { InitiativeAdmin } from '../../models/initiatives'
import { relate, withEager } from '../../hooks/relations'
import {
  addFilteredTotal,
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
  buildQueryFromRequest,
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import refreshSearchIndex from '../../hooks/refreshSearchIndex'

export default (app) => {
  const eager = '[goals, ownerships, badges]'
  const service = createService({
    model: InitiativeAdmin,
    whitelist: ['$eager', '$ilike', '$joinRelation'],
    paginate: {
      default: 50,
    },
    allowedEager: eager,
  })

  app.use('/admin/initiatives', service)
  app.service('/admin/initiatives').hooks({
    before: {
      all: [refreshSearchIndex],
      find: [buildQueryFromRequest('name'), withEager(eager)],
      get: [withEager(eager)],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: [],
    },
    after: {
      all: [],
      find: [addFilteredTotal, mapResultListRelationsToIds(eager)],
      get: [mapResultRelationsToIds(eager)],
      create: [
        relate(InitiativeAdmin, 'goals'),
        relate(InitiativeAdmin, 'ownerships'),
        relate(InitiativeAdmin, 'badges'),
      ],
      update: [],
      patch: [
        relate(InitiativeAdmin, 'goals'),
        relate(InitiativeAdmin, 'ownerships'),
        relate(InitiativeAdmin, 'badges'),
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
