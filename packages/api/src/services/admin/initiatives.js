import { iff } from 'feathers-hooks-common'
import createService from 'feathers-objection'
import {
  buildQueryFromRequest,
  filterEntriesByOriginPermissions,
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
  parseQueryOptions
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'
import { InitiativeAdmin } from '../../models/initiatives'

export default (app) => {
  const eager = '[goals, ownerships, badges]'
  const service = createService({
    model: InitiativeAdmin,
    whitelist: ['$eager', '$ilike', '$joinRelation', '$details', '$modify'],
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/initiatives', service)
  app.service('/admin/initiatives').hooks({
    before: {
      find: [
        parseQueryOptions,
        buildQueryFromRequest('name'),
        withEager(eager),
        filterEntriesByOriginPermissions
      ],
      get: [parseQueryOptions, withEager(eager)],
      create: [parseQueryOptions, setCreatedAt],
      update: [parseQueryOptions, setUpdatedAt],
      patch: [parseQueryOptions, setUpdatedAt],
      remove: [parseQueryOptions]
    },
    after: {
      find: [
        iff(
          (ctx) => !ctx.queryOptions.relationsDetails,
          mapResultListRelationsToIds(eager)
        )
      ],
      get: [
        iff(
          (ctx) => !ctx.queryOptions.relationsDetails,
          mapResultRelationsToIds(eager)
        )
      ],
      create: [
        relate(InitiativeAdmin, 'goals'),
        relate(InitiativeAdmin, 'ownerships'),
        relate(InitiativeAdmin, 'badges')
      ],
      update: [],
      patch: [
        relate(InitiativeAdmin, 'goals'),
        relate(InitiativeAdmin, 'ownerships'),
        relate(InitiativeAdmin, 'badges')
      ]
    }
  })
}
