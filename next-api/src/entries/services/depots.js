import createService from 'feathers-objection'
import { hooks as authHooks } from '@feathersjs/authentication'

import Depot from '../../app/models/depots'
import { connectFarms, connectOwner } from '../hooks/relations'
import { restrictToUser, restrictToOwner } from '../../auth/hooks/authorization'
import { featureCollection } from '../../app/util/jsonUtils'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'

export default app => {
  const service = createService({
    model: Depot
    // allowedEager: ['roles', 'places']
    // eagerFilters: [
    //   {
    //     expression: 'places.[products]',
    //     filter: builder => builder.select(['category', 'name'])
    //   }
    // ]
  })

  const withEager = builder =>
    builder
      .eager('places.[products]')
      .modifyEager('places.[products]', b => b.select(['category', 'name']))

  // service.get = async id => withEager(Depot.query().findById(id))
  //
  // service.getWithOwnerships = async id =>
  //   Depot.query()
  //     .findById(id)
  //     .eager('ownerships')

  app.use('/depots', service)

  app.service('depots').hooks({
    before: {
      create: [authHooks.authenticate('jwt'), restrictToUser, setCreatedAt],
      update: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      patch: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      remove: [authHooks.authenticate('jwt'), restrictToOwner],
      find: [
        ctx => {
          ctx.params.query.$eager = 'places.[products]'
          return ctx
        },
        ctx => ctx.app.info('ctx', ctx)
      ],
      find: [
        ctx => {
          ctx.params.query.$eager = 'places.[products]'
          return ctx
        },
        ctx => ctx.app.info('ctx', ctx)
      ]
    },
    after: {
      create: [connectFarms, connectOwner],
      patch: [connectFarms]
    }
  })
}
