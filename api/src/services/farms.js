import createService from 'feathers-objection/lib/index'

import Farm from '../models/farms'
import wrapFeatureCollection from '../hooks/geoJson'
import {
  relateOwner,
  withEager,
  selectEntryColumns,
  relate
} from '../hooks/relations'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'
import { entryColumns } from './entries'

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
          builder.select(['category', 'name'])
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
  app.service('farms').hooks({
    before: {
      all: [],
      find: [withEager('[products]'), selectEntryColumns],
      get: [withEager('[depots, products]')],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: []
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [
        relate(Farm, 'products'),
        relate(Farm, 'depots'),
        relateOwner,
        sendNewEntryNotification
      ],
      update: [],
      patch: [relate(Farm, 'products'), relate(Farm, 'depots')],
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
