import { raw } from 'objection'
import createService from 'feathers-objection/lib/index'
import authentication from '@feathersjs/authentication/lib/index'

import Initiative from '../../app/models/initiatives'
import { featureCollection } from '../util/geojsonUtils'
import { restrictToUser, restrictToOwner } from '../../auth/hooks/authorization'

const selectGeoJSON = raw(
  `
      'Feature' as type, 
      json_build_object(
        'type', 'Point',
        'coordinates', json_build_array(??, ??)
      ) as geometry,
      json_build_object(
        'id',  ??,
        'name', ??,
        'city', ??, 
        'url', ??,
        'description', ??,
        'type', 'Initiative'
      ) as properties  
      `,
  ['longitude', 'latitude', 'id', 'name', 'city', 'url', 'description']
)

export default app => {
  const service = createService({
    model: Initiative,
    allowedEager: 'roles'
  })

  service.find = async () =>
    featureCollection(await Initiative.query().select(selectGeoJSON))

  service.get = async id =>
    Initiative.query()
      .findById(id)
      .select(selectGeoJSON)

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
