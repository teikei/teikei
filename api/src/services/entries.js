import { iff } from 'feathers-hooks-common'
import _ from 'lodash'

import Depot from '../models/depots'
import Farm from '../models/farms'
import Initiative from '../models/initiatives'
import toGeoJSON from '../hooks/geoJson'
import { entryColumns, filterOwnedEntries, withEager } from '../hooks/relations'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = {
    async find(params) {
      const { northEast, southWest } = params.query
      const [latSW, lngSW, latNE, lngNE] =
        northEast && southWest
          ? [southWest.lat, southWest.lng, northEast.lat, northEast.lng]
          : [44, 0, 55, 23]

      const farms = await Farm.query()
        .eager(params.query.$eager || 'products')
        .modifyEager('products', b =>
          b.select(['products.id', 'category', 'name'])
        )
        .select(entryColumns())
        .whereBetween('latitude', [latSW, latNE])
        .whereBetween('longitude', [lngSW, lngNE])
      const depots = await Depot.query()
        .eager(params.query.$eager)
        .select(entryColumns())
        .whereBetween('latitude', [latSW, latNE])
        .whereBetween('longitude', [lngSW, lngNE])
      const initiatives = await Initiative.query()
        .eager(params.query.$eager)
        .select(entryColumns())
        .whereBetween('latitude', [latSW, latNE])
        .whereBetween('longitude', [lngSW, lngNE])
      return farms.concat(depots).concat(initiatives)
    }
  }

  app.use('/entries', service)

  app
    .service('entries')
    .hooks({
      before: {
        all: [],
        find: [
          iff(ctx => _.has(ctx.params.query, 'mine'), withEager('ownerships'))
        ]
      },
      after: {
        all: [],
        find: [iff(ctx => _.has(ctx.params.query, 'mine'), filterOwnedEntries)]
      },
      error: {
        all: [],
        find: []
      }
    })
    .hooks({
      after: {
        all: [filterAllowedFields, toGeoJSON()]
      }
    })
}
