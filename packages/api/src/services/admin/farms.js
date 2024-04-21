import createService from 'feathers-objection'
import { iff } from 'feathers-hooks-common'

import { FarmAdmin } from '../../models/farms'
import {
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
  buildQueryFromRequest,
  parseQueryOptions
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'
import refreshSearchIndex from '../../hooks/refreshSearchIndex'

export default (app) => {
  const eager = '[products, ownerships, badges, depots]'
  const service = createService({
    model: FarmAdmin,
    whitelist: ['$eager', '$ilike', '$joinRelation', '$details', '$modify'],
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/farms', service)
  app.service('/admin/farms').hooks({
    before: {
      find: [
        parseQueryOptions,
        buildQueryFromRequest('name'),
        withEager(eager)
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
        relate(FarmAdmin, 'products'),
        relate(FarmAdmin, 'badges'),
        relate(FarmAdmin, 'ownerships'),
        relate(FarmAdmin, 'depots'),
        refreshSearchIndex
      ],
      update: [refreshSearchIndex],
      patch: [
        relate(FarmAdmin, 'products'),
        relate(FarmAdmin, 'badges'),
        relate(FarmAdmin, 'ownerships'),
        relate(FarmAdmin, 'depots'),
        refreshSearchIndex
      ],
      remove: [refreshSearchIndex]
    }
  })
}
