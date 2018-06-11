import createService from 'feathers-objection'
import authentication from '@feathersjs/authentication/lib/index'

import Depot from '../../app/models/depots'
import { featureCollection } from '../../app/util/geojsonUtils'
import { restrictToUser, restrictToOwner } from '../../auth/hooks/authorization'

export default app => {
  const service = createService({
    model: Depot,
    allowedEager: ['roles', 'places']
  })

  service.find = async () => featureCollection(await Depot.query())

  service.get = async id =>
    Depot.query()
      .findById(id)
      .eager('places')

  service.getWithOwnerships = async id =>
    Depot.query()
      .findById(id)
      .eager('ownerships')

  app.use('/depots', service)
  app.service('depots').hooks({
    before: {
      create: [authentication.hooks.authenticate('jwt'), restrictToUser],
      update: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      patch: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      remove: [authentication.hooks.authenticate('jwt'), restrictToOwner]
    }
  })
}
