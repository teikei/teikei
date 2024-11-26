import { disallow } from 'feathers-hooks-common'
import createService from 'feathers-objection'

import filterAllowedFields from '../hooks/filterAllowedFields'
import Goal from '../models/goals'

export default (app) => {
  const service = createService({
    model: Goal
  })

  app.use('/goals', service)
  app.service('goals').hooks({
    before: {
      create: [disallow('external')],
      update: [disallow()],
      patch: [disallow('external')],
      remove: [disallow('external')]
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields]
    }
  })
}
