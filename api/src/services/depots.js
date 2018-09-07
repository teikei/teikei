import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common'

import Depot from '../models/depots'
import {
  entryColumns,
  relate,
  relateOwner,
  selectEntryColumns,
  withEager
} from '../hooks/relations'
import toGeoJSON from '../hooks/geoJson'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = createService({
    model: Depot,
    allowedEager: '[farms.[products], ownerships]',
    eagerFilters: [
      {
        expression: 'farms',
        filter: builder => {
          builder.select(entryColumns('farms'))
        }
      },
      {
        expression: 'ownerships',
        filter: builder => {
          builder.select(['users.id', 'email', 'name'])
        }
      }
    ]
  })

  app.use('/depots', service)

  const format = toGeoJSON('farms')

  app.service('depots').hooks({
    before: {
      all: [],
      find: [selectEntryColumns],
      get: [withEager('[farms.[products]]')],
      create: [setCreatedAt],
      update: [disallow()],
      patch: [setUpdatedAt],
      remove: []
    },

    after: {
      all: [filterAllowedFields],
      find: [format],
      get: [format],
      create: [
        relate(Depot, 'farms'),
        relateOwner,
        sendNewEntryNotification,
        format
      ],
      patch: [relate(Depot, 'farms'), format],
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
