import authentication from '@feathersjs/authentication'
import authManagement from 'feathers-authentication-management'

import { restrictToUser } from '../hooks/authorization'

export default app => {
  app.configure(authManagement())

  app.service('authManagement').hooks({
    before: {
      create: [authentication.hooks.authenticate('jwt'), restrictToUser],
      remove: [authentication.hooks.authenticate('jwt')]
    }
  })
}
