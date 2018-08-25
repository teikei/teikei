import createService from 'feathers-objection'
import { hooks as localHooks } from '@feathersjs/authentication-local'
import { disallow } from 'feathers-hooks-common'
import { hooks as verifyHooks } from 'feathers-authentication-management'

import User from '../models/users'
import {
  setOrigin,
  protectUserFields,
  validateUserPassword
} from '../hooks/user'
import {
  convertVerifyDatesFromISOStrings,
  convertVerifyDatesToISOStrings
} from '../hooks/verify'
import { sendConfirmationEmail } from '../hooks/email'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { iff, isProvider } from 'feathers-hooks-common/lib'

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
        convertVerifyDatesToISOStrings,
        setCreatedAt
      ],
      update: [disallow('external')],
      patch: [
        validateUserPassword,
        protectUserFields,
        convertVerifyDatesToISOStrings,
        setUpdatedAt
      ],
      remove: [disallow('external')]
    },

    after: {
      all: [],
      find: [],
      get: [convertVerifyDatesFromISOStrings],
      create: [
        sendConfirmationEmail,
        verifyHooks.removeVerification(),
        iff(isProvider('external'), localHooks.protect('password', 'origin', 'baseurl'))
      ],
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
