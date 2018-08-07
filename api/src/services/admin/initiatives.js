import createService from 'feathers-objection/lib/index'
import { hooks as authHooks } from '@feathersjs/authentication'

import Initiative from '../../app/models/admin/initiatives'
import { connectGoalsById, connectOwner, withEager } from '../../hooks/relations'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'

export default app => {
  const service = createService({
    model: Initiative,
    paginate: {
      default: 50,
      max: 100
    },
    allowedEager: '[goals, ownerships]'
  })

  app.use('/admin/initiatives', service)
  app.service('/admin/initiatives').hooks({
    before: {
      // all: [authHooks.authenticate('jwt'), restrictToSuperAdmin],
      find: [withEager('[goals, ownerships]')],
      get: [withEager('[goals, ownerships]')],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: []
    },
    after: {
      all: [],
      find: [addFilteredTotal],
      get: [],
      create: [connectGoalsById, connectOwner],
      update: [],
      patch: [connectGoalsById],
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
