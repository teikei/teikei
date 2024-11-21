import createService from 'feathers-objection'
import { iff } from 'feathers-hooks-common'

import { DepotAdmin } from '../../models/depots'
import {
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
  buildQueryFromRequest,
  parseQueryOptions,
  filterEntriesByOriginPermissions
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'
import refreshSearchIndex from '../../hooks/refreshSearchIndex'

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
