import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common/lib'

import Initiative from '../models/initiatives'
import toGeoJSON from '../hooks/geoJson'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import {
  relate,
  relateOwner,
  selectEntryColumns,
  withEager
} from '../hooks/relations'
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

  const format = toGeoJSON()

  app.service('initiatives').hooks({
    before: {
      all: [],
      find: [selectEntryColumns],
      get: [withEager('[goals]')],
      create: [setCreatedAt],
      update: [disallow()],
      patch: [setUpdatedAt],
      remove: []
    },

    after: {
      all: [],
      find: [format],
      get: [format],
      create: [
        relate(Initiative, 'goals'),
        relateOwner,
        sendNewEntryNotification,
        format
      ],
      patch: [relate(Initiative, 'goals'), format],
      remove: [format]
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      patch: [],
      remove: []
    }
  })
}
