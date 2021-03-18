import createService from 'feathers-objection'

import { InitiativeAdmin } from '../../models/initiatives'
import { relate, withEager } from '../../hooks/relations'
import {
  addFilteredTotal,
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import refreshSearchIndex from '../../hooks/refreshSearchIndex'

export default (app) => {
  const eager = '[goals, ownerships]'
  const service = createService({
    model: InitiativeAdmin,
    whitelist: ['$eager', '$ilike'],
    paginate: {
      default: 50,
    },
    allowedEager: eager,
  })

  app.use('/admin/initiatives', service)
  app.service('/admin/initiatives').hooks({
    before: {
      all: [refreshSearchIndex],
      find: [withEager(eager)],
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
      ],
      update: [],
      patch: [
        relate(InitiativeAdmin, 'goals'),
        relate(InitiativeAdmin, 'ownerships'),
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
