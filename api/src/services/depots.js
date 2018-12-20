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
import { iffElse } from 'feathers-hooks-common/lib'

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
          builder.select(['users.id', 'email', 'name', 'origin', 'baseurl'])
        }
      }
    ]
  })

  app.use('/depots', service)

  app
    .service('depots')
    .hooks({
      before: {
        all: [],
        find: iffElse(
          ctx => ctx.params.query.$details !== "true",
          [selectEntryColumns],
          [withEager('[farms.[products]]')]
        ),
        get: [withEager('[farms.[products]]')],
        create: [setCreatedAt],
        update: [disallow()],
        patch: [setUpdatedAt],
        remove: []
      },
      after: {
        all: [],
        find: [],
        get: [],
        create: [relate(Depot, 'farms'), relateOwner, sendNewEntryNotification],
        patch: [relate(Depot, 'farms')],
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
        all: [filterAllowedFields, toGeoJSON('farms')]
      }
    })
}
