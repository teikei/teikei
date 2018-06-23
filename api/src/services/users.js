import createService from 'feathers-objection'
import { hooks as localHooks } from '@feathersjs/authentication-local'
import { disallow } from 'feathers-hooks-common'
import { hooks as verifyHooks } from 'feathers-authentication-management'

import User from '../app/models/users'
import {
  setOrigin,
  protectUserFields,
  validateExternalUser
} from '../hooks/user'
import {
  convertVerifyDatesRead,
  convertVerifyDatesWrite,
  sendConfirmationEmail
} from '../hooks/verify'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'

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
        verifyHooks.addVerification(),
        localHooks.hashPassword({ passwordField: 'password' }),
        convertVerifyDatesWrite,
        setCreatedAt
      ],
      update: [disallow('external')],
      patch: [
        validateExternalUser,
        protectUserFields,
        localHooks.hashPassword({ passwordField: 'password' }),
        convertVerifyDatesWrite,
        setUpdatedAt
      ],
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
