import createService from 'feathers-objection'
import { iff } from 'feathers-hooks-common'

import { UserAdmin } from '../../models/users'
import {
  addFilteredTotal,
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
  buildQueryFromRequest,
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, selectUserColumns, withEager } from '../../hooks/relations'

export default (app) => {
  const eager = '[roles]'
  const service = createService({
    model: UserAdmin,
    whitelist: ['$eager', '$ilike', '$details', '$joinRelation', '$details'],
    paginate: {
      default: 50,
    },
    allowedEager: eager,
  })

  app.use('/admin/users', service)
  app.service('/admin/users').hooks({
    before: {
      all: [],
      find: [
        selectUserColumns,
        buildQueryFromRequest('email'),
        withEager(eager),
      ],
      get: [selectUserColumns, withEager(eager)],
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
      create: [relate(UserAdmin, 'roles')],
      update: [],
      patch: [relate(UserAdmin, 'roles')],
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

  app.use('/admin/users/:userId/entries', {
    find(params) {
      return app.service('admin/entries').find({
        query: {
          userId: params.route.userId,
        },
      })
    },
  })
}
