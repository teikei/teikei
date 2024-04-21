import createService from 'feathers-objection'
import { iff } from 'feathers-hooks-common'

import { UserAdmin } from '../../models/users'
import {
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
  buildQueryFromRequest,
  parseQueryOptions
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, selectUserColumns, withEager } from '../../hooks/relations'

export default (app) => {
  const eager = '[roles]'
  const service = createService({
    model: UserAdmin,
    whitelist: ['$eager', '$ilike', '$details', '$joinRelation', '$details'],
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/users', service)
  app.service('/admin/users').hooks({
    before: {
      find: [
        parseQueryOptions,
        selectUserColumns,
        buildQueryFromRequest('email'),
        withEager(eager)
      ],
      get: [parseQueryOptions, selectUserColumns, withEager(eager)],
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
      create: [relate(UserAdmin, 'roles')],
      patch: [relate(UserAdmin, 'roles')]
    }
  })

  app.use('/admin/users/:userId/entries', {
    find(params) {
      return app.service('admin/entries').find({
        query: {
          userId: params.route.userId
        }
      })
    }
  })
}
