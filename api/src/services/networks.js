import { iff } from 'feathers-hooks-common'
import _ from 'lodash'

import { filterOwnedEntries, withEager } from '../hooks/relations'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = {
    async find(params) {
      const result = await app.service('entries').find({
        ...params,
        provider: null,
        query: { ...params.query, $eager: 'network' }
      })
      console.log("_.uniqBy(result.map(e => e.network), 'id').length", _.uniqBy(result.map(e => e.network), 'id').length);

      return _.uniqBy(result.map(e => e.network), 'id')
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
        all: [filterAllowedFields]
      }
    })
}
