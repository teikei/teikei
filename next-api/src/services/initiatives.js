import createService from 'feathers-objection/lib/index'
import { hooks as authHooks } from '@feathersjs/authentication/lib/index'

import Initiative from '../app/models/initiatives'
import { wrapFeatureCollection } from '../hooks/geoJson'
import { restrictToUser, restrictToOwner } from '../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { connectGoals, connectOwner } from '../hooks/relations'

export default app => {
  const service = createService({
    model: Initiative,
    allowedEager: ['roles', 'goals']
  })

  const withEager = builder =>
    builder.eager('goals').modifyEager('goals', b => b.select(['name']))

  service.find = async () => withEager(Initiative.query())
  service.get = async id => withEager(Initiative.query().findById(id))

  service.getWithOwnerships = async id =>
    Initiative.query()
      .findById(id)
      .eager('ownerships')

  app.use('/initiatives', service)

  app.service('initiatives').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [authHooks.authenticate('jwt'), restrictToUser, setCreatedAt],
      update: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      patch: [authHooks.authenticate('jwt'), restrictToOwner, setUpdatedAt],
      remove: [authHooks.authenticate('jwt'), restrictToOwner]
    },

    after: {
      all: [],
      find: [wrapFeatureCollection],
      get: [],
      create: [connectGoals, connectOwner],
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
