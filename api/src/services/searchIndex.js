import BaseModel from '../models/base'

export default app => {
  const service = {
    create: async () =>
      BaseModel.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY entries_search')
  }

  app.use('/searchindex', service)

  app
    .service('searchindex')
    .hooks({
      before: {
        all: [],
        find: []
      },
      after: {
        all: [],
        find: []
      },
      error: {
        all: [],
        find: []
      }
    })
    .hooks({
      after: {
        all: []
      }
    })
}
