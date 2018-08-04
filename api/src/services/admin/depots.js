import createService from 'feathers-objection/lib/index'

import Depot from '../../app/models/admin/depots'

export default app => {
  const service = createService({
    model: Depot,
  })

  app.use('/admin/depots', service)
  app
    .service('/admin/depots')
    .hooks({
      before: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
      },
      after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
      },
      error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
      }
    })
}
