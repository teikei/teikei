import { disallow, iffElse } from 'feathers-hooks-common'
import createService from 'feathers-objection'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendNewEntryNotification } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'
import toGeoJSON from '../hooks/geoJson'
import refreshSearchIndex from '../hooks/refreshSearchIndex'
import {
  relate,
  relateOwner,
  selectActiveEntries,
  selectEntryColumns,
  withEager
} from '../hooks/relations'
import Initiative from '../models/initiatives'

export default (app) => {
  const service = createService({
    model: Initiative,
    allowedEager: '[goals, ownerships, badges]',
    whitelist: ['$eager', '$select', '$details'],
    eagerFilters: [
      {
        expression: 'ownerships',
        filter: (builder) => {
          builder.select(['users.id', 'email', 'name', 'origin', 'baseurl'])
        }
      },
      {
        expression: 'badges',
        filter: (builder) => {
          builder.select(['badges.id', 'name', 'category', 'url', 'logo'])
        }
      }
    ]
  })

  app.use('/initiatives', service)

  app.service('initiatives').hooks({
    before: {
      find: [
        iffElse(
          (ctx) => ctx.params.query.$details !== 'true',
          [selectEntryColumns],
          [withEager('[goals, badges]')]
        ),
        (ctx) => {
          delete ctx.params.query.$details
          return ctx
        },
        selectActiveEntries
      ],
      get: [withEager('[goals, badges]'), selectActiveEntries],
      create: [setCreatedAt],
      update: [disallow()],
      patch: [setUpdatedAt]
    },
    after: {
      find: [filterAllowedFields, refreshSearchIndex, toGeoJSON()],
      get: [filterAllowedFields, refreshSearchIndex, toGeoJSON()],
      create: [
        relate(Initiative, 'goals'),
        relate(Initiative, 'badges'),
        relateOwner,
        sendNewEntryNotification,
        filterAllowedFields,
        refreshSearchIndex,
        toGeoJSON()
      ],
      patch: [
        relate(Initiative, 'goals'),
        relate(Initiative, 'badges'),
        filterAllowedFields,
        refreshSearchIndex,
        toGeoJSON()
      ],
      remove: [filterAllowedFields, refreshSearchIndex, toGeoJSON()]
    }
  })
}
