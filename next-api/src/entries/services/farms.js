import createService from 'feathers-objection/lib/index'
import authentication from '@feathersjs/authentication/lib/index'

import Farm from '../../app/models/farms'
import { featureCollection } from '../../app/util/geojsonUtils'
import { restrictToUser, restrictToOwner } from '../../auth/hooks/authorization'

export default app => {
  const service = createService({
    model: Farm,
    allowedEager: ['roles', 'places']
  })

  service.find = async () => featureCollection(await Farm.query())

  service.get = async id =>
    Farm.query()
      .findById(id)
      .eager('places')

  service.getWithOwnerships = async id =>
    Farm.query()
      .findById(id)
      .eager('ownerships')

  app.use('/depots', service)

  app.use('/farms', service)
  app.service('farms').hooks({
    before: {
      create: [authentication.hooks.authenticate('jwt'), restrictToUser],
      update: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      patch: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      remove: [authentication.hooks.authenticate('jwt'), restrictToOwner]
    }
  })
}
