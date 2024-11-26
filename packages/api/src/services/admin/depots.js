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
import refreshSearchIndex from '../../hooks/refreshSearchIndex'
import { relate, withEager } from '../../hooks/relations'
import { DepotAdmin } from '../../models/depots'

export default (app) => {
  const eager = '[ownerships, farms]'
  const service = createService({
    model: DepotAdmin,
    whitelist: ['$eager', '$ilike', '$details', '$modify'],
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/depots', service)
  app.service('/admin/depots').hooks({
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
        ),
        refreshSearchIndex
      ],
      get: [
        iff(
          (ctx) => !ctx.queryOptions.relationsDetails,
          mapResultRelationsToIds(eager)
        ),
        refreshSearchIndex
      ],
      create: [
        relate(DepotAdmin, 'ownerships'),
        relate(DepotAdmin, 'farms'),
        refreshSearchIndex
      ],
      update: [refreshSearchIndex],
      patch: [
        relate(DepotAdmin, 'ownerships'),
        relate(DepotAdmin, 'farms'),
        refreshSearchIndex
      ],
      remove: [refreshSearchIndex]
    }
  })
}
