import createService from 'feathers-objection/lib/index'

import User from '../../app/models/admin/users'
import { addFilteredTotal } from '../../hooks/admin'
import { restrictToSuperAdmin } from '../../hooks/authorization'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'

export default app => {
  const eager = '[roles]'
  const service = createService({
    model: User,
    paginate: {
      default: 50
    },
    allowedEager: eager
  })

  app.use('/admin/users', service)
  app.service('/admin/users').hooks({
    before: {
      all: [restrictToSuperAdmin],
      find: [withEager(eager)],
      get: [withEager(eager)],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: []
    },
    after: {
      all: [],
      find: [addFilteredTotal],
      get: [],
      create: [relate(User, 'roles')],
      update: [],
      patch: [relate(User, 'roles')],
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
