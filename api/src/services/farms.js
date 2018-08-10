import createService from 'feathers-objection/lib/index'

import Farm from '../models/farms'
import wrapFeatureCollection from '../hooks/geoJson'
import { relateOwner, connectProducts, withEager } from '../hooks/relations'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'

export default app => {
  const service = createService({
    model: Farm,
    allowedEager: '[places, products, ownerships]',
    eagerFilters: [
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
      find: [withEager('[places, products, ownerships]')],
      get: [withEager('[places, products, ownerships]')],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: []
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [connectProducts, relateOwner, sendNewEntryNotification],
      update: [],
      patch: [connectProducts],
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
