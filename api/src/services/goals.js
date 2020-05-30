import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common'

import Goal from '../models/goals'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default (app) => {
  const service = createService({
    model: Goal,
  })

  app.use('/goals', service)
  app
    .service('goals')
    .hooks({
      before: {
        all: [],
        find: [],
        get: [],
        create: [disallow('external')],
        update: [disallow()],
        patch: [disallow('external')],
        remove: [disallow('external')],
      },
      after: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: [],
      },
      error: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: [],
      },
    })
    .hooks({
      after: {
        all: [filterAllowedFields],
      },
    })
}
