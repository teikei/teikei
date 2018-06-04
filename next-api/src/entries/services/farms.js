import { raw } from 'objection'
import createService from 'feathers-objection/lib/index'
import authentication from '@feathersjs/authentication/lib/index'

import Farm from '../../app/models/farms'
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
        'accepts_new_members', ??,
        'founded_at_year', ??,
        'founded_at_month', ??,
        'maximum_members', ??,
        'additional_product_information', ??,
        'participation', ??,
        'acts_ecological', ??,
        'economical_behavior', ??,
        'type', 'Farm'
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
    'accepts_new_members',
    'founded_at_year',
    'founded_at_month',
    'maximum_members',
    'additional_product_information',
    'participation',
    'acts_ecological',
    'economical_behavior'
  ]
)

export default app => {
  const service = createService({
    model: Farm,
    allowedEager: 'roles'
  })

  service.find = async () =>
    featureCollection(await Farm.query().select(selectGeoJSON))

  service.get = async id =>
    Farm.query()
      .findById(id)
      .select(selectGeoJSON)

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
