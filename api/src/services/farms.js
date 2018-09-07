import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common/lib'

import Farm from '../models/farms'
import toGeoJSON from '../hooks/geoJson'
import {
  entryColumns,
  relate,
  relateOwner,
  selectEntryColumns,
  withEager
} from '../hooks/relations'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'

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

  app
    .service('farms')
    .hooks({
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
        find: [],
        get: [],
        create: [
          relate(Farm, 'products'),
          relate(Farm, 'depots'),
          relateOwner,
          sendNewEntryNotification
        ],
        patch: [relate(Farm, 'products'), relate(Farm, 'depots')],
        remove: []
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
    .hooks({
      after: {
        all: [filterAllowedFields, toGeoJSON('depots')]
      }
    })
}
