import { disallow } from 'feathers-hooks-common'
import createService from 'feathers-objection'

import filterAllowedFields from '../hooks/filterAllowedFields'
import Badge from '../models/badges'

export default (app) => {
  const service = createService({
    model: Badge
  })

  app.use('/badges', service)
  app.service('badges').hooks({
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
      update: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields]
    }
  })
}
