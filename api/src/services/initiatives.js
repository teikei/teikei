import createService from 'feathers-objection'

import Initiative from '../models/initiatives'
import wrapFeatureCollection from '../hooks/geoJson'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { relate, relateOwner, selectEntryColumns, withEager } from '../hooks/relations'
import { sendNewEntryNotification } from '../hooks/email'
import Depot from '../models/depots'

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
      find: [selectEntryColumns],
      get: [withEager('[goals]')],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: []
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [relate(Initiative, 'goals'), relateOwner, sendNewEntryNotification],
      update: [relate(Initiative, 'goals')],
      patch: [relate(Initiative, 'goals')],
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
