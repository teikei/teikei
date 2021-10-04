import createService from 'feathers-objection'
import { iff } from 'feathers-hooks-common'

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
    whitelist: ['$eager', '$ilike', '$joinRelation', '$details'],
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
      find: [
        addFilteredTotal,
        iff(
          (ctx) => ctx.params.query.$details !== 'true',
          mapResultListRelationsToIds(eager)
        ),
      ],
      get: [
        iff(
          (ctx) => ctx.params.query.$details !== 'true',
          mapResultRelationsToIds(eager)
        ),
      ],
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
