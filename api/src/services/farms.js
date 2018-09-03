import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common/lib'

import Farm from '../models/farms'
import toGeoJSON from '../hooks/geoJson'
import {
  relateOwner,
  withEager,
  selectEntryColumns,
  relate,
  entryColumns
} from '../hooks/relations'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'

export default app => {
  const service = createService({
    model: Farm,
    allowedEager: '[depots, products, ownerships]',
    eagerFilters: [
      {
        expression: 'depots',
        filter: builder => {
          builder.select(entryColumns('depots'))
        }
      },
      {
        expression: 'products',
        filter: builder => {
          builder.select(['products.id', 'category', 'name'])
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

  app.use('/farms', service)

  const format = toGeoJSON('depots')

  app.service('farms').hooks({
    before: {
      all: [],
      find: [withEager('[products]'), selectEntryColumns],
      get: [withEager('[depots, products]')],
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
        relate(Farm, 'products'),
        relate(Farm, 'depots'),
        relateOwner,
        sendNewEntryNotification,
        format
      ],
      patch: [relate(Farm, 'products'), relate(Farm, 'depots'), format],
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
