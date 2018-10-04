import createService from 'feathers-objection'
import { disallow } from 'feathers-hooks-common/lib'

import Initiative from '../models/initiatives'
import toGeoJSON from '../hooks/geoJson'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { relate, relateOwner, selectEntryColumns, withEager } from '../hooks/relations'
import { sendNewEntryNotification } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = createService({
    model: Initiative,
    allowedEager: '[goals, ownerships]',
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
        find: [selectEntryColumns],
        get: [withEager('[goals]')],
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
