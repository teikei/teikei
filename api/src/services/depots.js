import createService from 'feathers-objection'
import { hooks as authHooks } from '@feathersjs/authentication'

import Depot from '../models/depots'
import { relate, relateOwner, withEager } from '../hooks/relations'
import wrapFeatureCollection from '../hooks/geoJson'
import { restrictToUser, restrictToOwner } from '../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'

export default app => {
  const service = createService({
    model: Depot,
    allowedEager: '[places.[products], ownerships]',
    eagerFilters: [
      {
        expression: 'places.[products]',
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

  app.use('/depots', service)

  app.service('depots').hooks({
    before: {
      all: [],
      find: [withEager('[places.[products], ownerships]')],
      get: [withEager('[places.[products], ownerships]')],
      create: [authHooks.authenticate('jwt'), restrictToUser, setCreatedAt],
      update: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      patch: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      remove: [authHooks.authenticate('jwt'), restrictToOwner]
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [relate(Depot, 'places'), relateOwner, sendNewEntryNotification],
      update: [],
      patch: [relate(Depot, 'places')],
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
