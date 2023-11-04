import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common'

import Badge from '../models/badges'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default (app) => {
  const service = createService({
    model: Badge,
  })

  app.use('/badges', service)
  app.service('badges').hooks({
    before: {
      find: [],
      get: [],
      create: [disallow('external')],
      update: [disallow()],
      patch: [disallow('external')],
      remove: [disallow('external')],
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields],
    },
  })
}
