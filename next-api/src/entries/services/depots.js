import createService from 'feathers-objection'
import { hooks as authHooks } from '@feathersjs/authentication'

import Depot from '../../app/models/depots'
import { connectFarms, connectOwner } from '../hooks/relations'
import { wrapFeatureCollection } from '../hooks/geoJson'
import { restrictToUser, restrictToOwner } from '../../auth/hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'

export default app => {
  const service = createService({
    model: Depot,
    allowedEager: ['roles', 'places']
  })

  const withEager = builder =>
    builder
      .eager('places.[products]')
      .modifyEager('places.[products]', b => b.select(['category', 'name']))

  service.find = async () => withEager(Depot.query())
  service.get = async id => withEager(Depot.query().findById(id))

  service.getWithOwnerships = async id =>
    Depot.query()
      .findById(id)
      .eager('ownerships')

  app.use('/depots', service)

  app.service('depots').hooks({
    before: {
      create: [authHooks.authenticate('jwt'), restrictToUser, setCreatedAt],
      update: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      patch: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      remove: [authHooks.authenticate('jwt'), restrictToOwner]
    },
    after: {
      create: [connectFarms, connectOwner],
      patch: [connectFarms],
      find: [wrapFeatureCollection]
    }
  })
}
