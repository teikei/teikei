import createService from 'feathers-objection'
import { disallow, iffElse } from 'feathers-hooks-common/lib'

import Initiative from '../models/initiatives'
import toGeoJSON from '../hooks/geoJson'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import {
  selectActiveEntries,
  relate,
  relateOwner,
  selectEntryColumns,
  withEager
} from '../hooks/relations'
import { sendNewEntryNotification } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = createService({
    model: Initiative,
    allowedEager: '[goals, ownerships]',
    whitelist: ['$eager', '$select', '$details'],
    eagerFilters: [
      {
        expression: 'ownerships',
        filter: builder => {
          builder.select(['users.id', 'email', 'name', 'origin', 'baseurl'])
        }
      }
    ]
  })

  app.use('/initiatives', service)

  app
    .service('initiatives')
    .hooks({
      before: {
        all: [],
        find: [
          iffElse(
            ctx => ctx.params.query.$details !== 'true',
            [selectEntryColumns],
            [withEager('[goals]')]
          ),
          ctx => {
            delete ctx.params.query.$details
            return ctx
          },
          selectActiveEntries
        ],
        get: [withEager('[goals]'), selectActiveEntries],
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
          relate(Initiative, 'goals'),
          relateOwner,
          sendNewEntryNotification
        ],
        patch: [relate(Initiative, 'goals')],
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
        all: [filterAllowedFields, toGeoJSON()]
      }
    })
}
