import createService from 'feathers-objection'
import authentication from '@feathersjs/authentication/lib/index'

import Depot from '../../app/models/depots'
import { connectFarms, connectOwner } from '../hooks/relations'
import { restrictToUser, restrictToOwner } from '../../auth/hooks/authorization'
import { featureCollection } from '../../app/util/jsonUtils'
import { setCreatedAt } from '../hooks/audit'

export default app => {
  const service = createService({
    model: Depot,
    allowedEager: ['roles', 'places']
  })

  const withEager = builder =>
    builder
      .eager('places.[products]')
      .modifyEager('places.[products]', b => b.select(['category', 'name']))

  service.find = async () => featureCollection(await withEager(Depot.query()))
  service.get = async id => withEager(Depot.query().findById(id))

  service.getWithOwnerships = async id =>
    Depot.query()
      .findById(id)
      .eager('ownerships')

  app.use('/depots', service)

  app.service('depots').hooks({
    before: {
      create: [
        authentication.hooks.authenticate('jwt'),
        restrictToUser,
        setCreatedAt
      ],
      update: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      patch: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      remove: [authentication.hooks.authenticate('jwt'), restrictToOwner]
    },
    after: {
      create: [connectFarms, connectOwner]
    }
  })
}
