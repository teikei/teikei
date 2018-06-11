import createService from 'feathers-objection/lib/index'
import authentication from '@feathersjs/authentication/lib/index'

import Initiative from '../../app/models/initiatives'
import { featureCollection } from '../../app/util/geojsonUtils'
import { restrictToUser, restrictToOwner } from '../../auth/hooks/authorization'

export default app => {
  const service = createService({
    model: Initiative,
    allowedEager: 'roles'
  })

  service.find = async () => featureCollection(await Initiative.query())

  service.getWithOwnerships = async id =>
    Initiative.query()
      .findById(id)
      .eager('ownerships')

  app.use('/initiatives', service)
  app.service('initiatives').hooks({
    before: {
      create: [authentication.hooks.authenticate('jwt'), restrictToUser],
      update: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      patch: [authentication.hooks.authenticate('jwt'), restrictToOwner],
      remove: [authentication.hooks.authenticate('jwt'), restrictToOwner]
    }
  })
}
