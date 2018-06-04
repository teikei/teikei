import createService from 'feathers-objection'
import local from '@feathersjs/authentication-local/lib/index'

import User from '../../app/models/users'

export default app => {
  const service = createService({
    model: User,
    allowedEager: 'roles'
  })

  app.use('/users', service)
  app.service('users').hooks({
    before: {
      create: [
        local.hooks.hashPassword({ passwordField: 'encrypted_password' })
      ]
    }
  })
}
