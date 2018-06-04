import { raw } from 'objection'

import Depot from '../../app/models/depots'
import Farm from '../../app/models/farms'
import Initiative from '../../app/models/initiatives'
import { featureCollection } from '../util/geojsonUtils'

const selectGeoJSON = type =>
  raw(
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
        'type', '${type}'
      ) as properties  
      `,
    ['longitude', 'latitude', 'id', 'name', 'city']
  )

export default app => {
  const service = {
    async find() {
      return featureCollection(
        await Farm.query()
          .select(selectGeoJSON('Farm'))
          .unionAll(
            Depot.query()
              .select(selectGeoJSON('Depot'))
              .unionAll(Initiative.query().select(selectGeoJSON('Initiative')))
          )
      )
    }
  }

  app.use('/entries', service)
  app.service('entries').hooks({})
}
