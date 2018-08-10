import createService from 'feathers-objection/lib/index'

import Initiative from '../models/initiatives'
import wrapFeatureCollection from '../hooks/geoJson'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { connectGoals, relateOwner, withEager } from '../hooks/relations'
import { sendNewEntryNotification } from '../hooks/email'

export default app => {
  const service = createService({
    model: Initiative,
    allowedEager: '[goals, ownerships]',
    eagerFilters: [
      {
        expression: 'ownerships',
        filter: builder => {
          builder.select(['users.id', 'email', 'name'])
        }
      }
    ]
  })

  app.use('/initiatives', service)

  app.service('initiatives').hooks({
    before: {
      all: [],
      find: [withEager('[goals, ownerships]')],
      get: [withEager('[goals, ownerships]')],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: []
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [connectGoals, relateOwner, sendNewEntryNotification],
      update: [],
      patch: [connectGoals],
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
