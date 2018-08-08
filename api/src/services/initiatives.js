import createService from 'feathers-objection/lib/index'
import { hooks as authHooks } from '@feathersjs/authentication/lib/index'

import Initiative from '../app/models/initiatives'
import wrapFeatureCollection from '../hooks/geoJson'
import { restrictToUser, restrictToOwner } from '../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { connectGoals, relateOwner, withEager } from '../hooks/relations'
import { sendNewEntryNotification } from '../hooks/email'

export default app => {
  const service = createService({
    model: Initiative,
    allowedEager: '[goals, ownerships]',
    eagerFilters: [
      {
        expression: 'ownerships',
        filter: builder => {
          builder.select(['users.id', 'email', 'name'])
        }
      }
    ]
  })

  app.use('/initiatives', service)

  app.service('initiatives').hooks({
    before: {
      all: [],
      find: [withEager('[goals, ownerships]')],
      get: [withEager('[goals, ownerships]')],
      create: [authHooks.authenticate('jwt'), restrictToUser, setCreatedAt],
      update: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      patch: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      remove: [authHooks.authenticate('jwt'), restrictToOwner]
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [connectGoals, relateOwner, sendNewEntryNotification],
      update: [],
      patch: [connectGoals],
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
