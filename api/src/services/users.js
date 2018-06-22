import createService from 'feathers-objection'
import { hooks as localHooks } from '@feathersjs/authentication-local'
import { disallow } from 'feathers-hooks-common'
import { hooks as verifyHooks } from 'feathers-authentication-management'

import User from '../app/models/users'
import { setOrigin, protectUserFields } from '../hooks/user'
import {
  convertVerifyDatesRead,
  convertVerifyDatesWrite,
  sendConfirmationEmail
} from '../hooks/verify'
import { setCreatedAt } from '../hooks/audit'

export default app => {
  const service = createService({
    model: User,
    allowedEager: 'roles'
  })

  app.use('/users', service)

  app.service('users').hooks({
    before: {
      all: [],
      find: [disallow('external')],
      get: [disallow('external')],
      create: [
        setOrigin,
        setCreatedAt,
        localHooks.hashPassword({ passwordField: 'password' }),
        verifyHooks.addVerification(),
        convertVerifyDatesWrite
      ],
      update: [disallow('external')],
      patch: [disallow('external'), convertVerifyDatesWrite],
      remove: []
    },

    after: {
      all: [localHooks.protect('password')],
      find: [],
      get: [convertVerifyDatesRead],
      create: [sendConfirmationEmail, verifyHooks.removeVerification()],
      update: [],
      patch: [],
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
