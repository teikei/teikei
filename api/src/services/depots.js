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
import wrapFeatureCollection from '../hooks/geoJson'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'

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

  app.service('depots').hooks({
    before: {
      all: [
        // TODO this shouldn't be required
        ctx => {
          delete ctx.params.query.$select
          return ctx
        }
      ],
      find: [selectEntryColumns],
      get: [withEager('[farms.[products]]')],
      create: [setCreatedAt],
      update: [disallow()],
      patch: [setUpdatedAt],
      remove: []
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [relate(Depot, 'farms'), relateOwner, sendNewEntryNotification],
      update: [],
      patch: [relate(Depot, 'farms')],
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
