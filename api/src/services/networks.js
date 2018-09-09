import { iff } from 'feathers-hooks-common'
import _ from 'lodash'

import toGeoJSON from '../hooks/geoJson'
import { filterOwnedEntries, withEager } from '../hooks/relations'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = {
    async find(params) {
      const entriesParams = params
      entriesParams.query.$eager = 'network'

      const result = await app.service('entries').find(entriesParams)
      return result
    }
  }

  app.use('/networks', service)

  app
    .service('networks')
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
