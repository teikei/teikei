import createService from 'feathers-objection/lib/index'
import { hooks as authHooks } from '@feathersjs/authentication/lib/index'

import Farm from '../app/models/farms'
import wrapFeatureCollection from '../hooks/geoJson'
import { restrictToUser, restrictToOwner } from '../hooks/authorization'
import { connectOwner, connectProducts, withEager } from '../hooks/relations'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'

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
      create: [authHooks.authenticate('jwt'), restrictToUser, setCreatedAt],
      update: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      patch: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      remove: [authHooks.authenticate('jwt'), restrictToOwner]
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [connectProducts, connectOwner],
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
