import { disallow } from 'feathers-hooks-common'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { BaseModel } from '../models/base'

export default app => {
  const service = {
    async create() {
      app.info('refreshing search index')
      await BaseModel.raw(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY entries_search'
      )
    }
  }

  app.use('/searchIndex', service)

  app
    .service('searchIndex')
    .hooks({
      before: {
        all: [disallow('external')],
        create: []
      },
      after: {
        all: [],
        create: []
      },
      error: {
        all: [],
        create: []
      }
    })
    .hooks({
      after: {
        all: [filterAllowedFields]
      }
    })

  // TODO refreshing every 5 minutes. maybe refresh immediately on change?
  setInterval(() => {
    app.service('searchIndex').create({})
  }, 5 * 60 * 1000)
}
