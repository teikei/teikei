import createService from 'feathers-objection'

import { UserAdmin } from '../../models/users'
import { addFilteredTotal } from '../../hooks/admin'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import { relate, withEager } from '../../hooks/relations'

export default (app) => {
  const eager = '[roles]'
  const service = createService({
    model: UserAdmin,
    whitelist: ['$eager', '$ilike'],
    paginate: {
      default: 50,
    },
    allowedEager: eager,
  })

  app.use('/admin/users', service)
  app.service('/admin/users').hooks({
    before: {
      all: [],
      find: [withEager(eager)],
      get: [withEager(eager)],
      create: [setCreatedAt],
      update: [setUpdatedAt],
      patch: [setUpdatedAt],
      remove: [],
    },
    after: {
      all: [],
      find: [addFilteredTotal],
      get: [],
      create: [relate(UserAdmin, 'roles')],
      update: [],
      patch: [relate(UserAdmin, 'roles')],
      remove: [],
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  })
}
