import createService from 'feathers-objection'
import { hooks as localHooks } from '@feathersjs/authentication-local'
import { disallow } from 'feathers-hooks-common'
import { hooks as verifyHooks } from 'feathers-authentication-management'

import User from '../../app/models/users'
import { setOrigin, protectUserFields } from '../hooks/user'
import {
  convertVerifyExpirationDates,
  sendConfirmationEmail
} from '../hooks/verify'
import { setCreatedAt } from '../../entries/hooks/audit'

export default app => {
  const service = createService({
    model: User,
    allowedEager: 'roles'
  })

  app.use('/users', service)

  app.service('users').hooks({
    before: {
      find: [disallow('external')],
      get: [disallow('external')],
      update: [disallow('external')],
      create: [
        setOrigin,
        setCreatedAt,
        localHooks.hashPassword({ passwordField: 'password' }),
        verifyHooks.addVerification(),
        convertVerifyExpirationDates
      ],
      patch: [convertVerifyExpirationDates, protectUserFields]
    },
    after: {
      create: [sendConfirmationEmail, verifyHooks.removeVerification()],
      all: [localHooks.protect('password')]
    }
  })
}
