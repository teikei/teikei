import { raw } from 'objection'
import createService from 'feathers-objection'
import authentication from '@feathersjs/authentication/lib/index'

import Depot from '../../app/models/depots'
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
        'delivery_days', ??,
        'type', 'Depot'
      ) as properties  
      `,
  [
    'longitude',
    'latitude',
    'id',
    'name',
    'city',
    'url',
    'description',
    'delivery_days'
  ]
)

export default app => {
  const service = createService({
    model: Depot,
    allowedEager: ['roles', 'places']
  })

  service.find = async () =>
    featureCollection(await Depot.query().select(selectGeoJSON))

  service.get = async id =>
    Depot.query()
      .findById(id)
      .eager('places')
      .select(selectGeoJSON)

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
