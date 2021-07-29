import createService from 'feathers-objection'

import { UserAdmin } from '../../models/users'
import {
  addFilteredTotal,
  mapResultListRelationsToIds,
  mapResultRelationsToIds,
  buildQueryFromRequest,
} from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'
import { iffElse } from 'feathers-hooks-common'

export default (app) => {
  const eager = '[roles]'
  const service = createService({
    model: UserAdmin,
    whitelist: ['$eager', '$ilike', '$details'],
    paginate: {
      default: 50,
    },
    allowedEager: '[roles, farms, depots, initiatives]',
  })

  app.use('/admin/users', service)
  app.service('/admin/users').hooks({
    before: {
      all: [],
      find: [buildQueryFromRequest('email'), withEager(eager)],
      get: [
        iffElse(
          (ctx) => ctx.params.query.$details !== 'true',
          withEager(eager),
          withEager('[roles, farms, depots, initiatives]')
        ),
        (ctx) => {
          delete ctx.params.query.$details
          return ctx
        },
      ],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: [],
    },
    after: {
      all: [],
      find: [addFilteredTotal, mapResultListRelationsToIds(eager)],
      get: [mapResultRelationsToIds(eager)],
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
}
