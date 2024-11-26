import { disallow, iffElse } from 'feathers-hooks-common'
import createService from 'feathers-objection'

import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'
import toGeoJSON from '../hooks/geoJson'
import refreshSearchIndex from '../hooks/refreshSearchIndex'
import {
  entryColumns,
  relate,
  relateOwner,
  selectActiveEntries,
  selectEntryColumns,
  withEager
} from '../hooks/relations'
import Depot from '../models/depots'

export default (app) => {
  const service = createService({
    model: Depot,
    allowedEager: '[farms.[products], ownerships]',
    whitelist: ['$eager', '$select', '$details'],
    eagerFilters: [
      {
        expression: 'farms',
        filter: (builder) => {
          builder.select(entryColumns('farms'))
        }
      },
      {
        expression: 'ownerships',
        filter: (builder) => {
          builder.select(['users.id', 'email', 'name', 'origin', 'baseurl'])
        }
      }
    ]
  })

  app.use('/depots', service)

  app.service('depots').hooks({
    before: {
      find: [
        iffElse(
          (ctx) => ctx.params.query.$details !== 'true',
          [selectEntryColumns],
          [withEager('[farms.[products]]')]
        ),
        (ctx) => {
          delete ctx.params.query.$details
          return ctx
        },
        selectActiveEntries
      ],
      get: [withEager('[farms.[products]]'), selectActiveEntries],
      create: [setCreatedAt],
      update: [disallow()],
      patch: [setUpdatedAt]
    },
    after: {
      find: [filterAllowedFields, refreshSearchIndex, toGeoJSON('farms')],
      get: [filterAllowedFields, refreshSearchIndex, toGeoJSON('farms')],
      create: [
        relate(Depot, 'farms'),
        relateOwner,
        sendNewEntryNotification,
        filterAllowedFields,
        refreshSearchIndex,
        toGeoJSON('farms')
      ],
      patch: [
        relate(Depot, 'farms'),
        filterAllowedFields,
        refreshSearchIndex,
        toGeoJSON('farms')
      ],
      remove: [filterAllowedFields, refreshSearchIndex, toGeoJSON('farms')]
    }
  })
}
