import createService from 'feathers-objection'

import Farm from '../models/farms'
import wrapFeatureCollection from '../hooks/geoJson'
import {
  relateOwner,
  withEager,
  selectEntryColumns,
  relate,
  entryColumns
} from '../hooks/relations'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'
import { disallow } from 'feathers-hooks-common/lib'

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
  app.service('farms').hooks({
    before: {
      all: [
        // TODO this shouldn't be required
        ctx => {
          delete ctx.params.query.$select
          return ctx
        }
      ],
      find: [withEager('[products]'), selectEntryColumns],
      get: [withEager('[depots, products]')],
      create: [setCreatedAt],
      update: [disallow()],
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
