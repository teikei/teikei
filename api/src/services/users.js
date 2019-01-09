import createService from 'feathers-objection'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import { hooks as localHooks } from '@feathersjs/authentication-local'
import { hooks as verifyHooks } from 'feathers-authentication-management'

import User from '../models/users'
import {
  setOrigin,
  assignUserRole,
  protectUserFields,
  validateUserPassword
} from '../hooks/user'
import {
  convertVerifyDatesFromISOStrings,
  convertVerifyDatesToISOStrings
} from '../hooks/verify'
import { sendConfirmationEmail } from '../hooks/email'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = createService({
    model: User,
    whitelist: ['$eager'],
    allowedEager: 'roles'
  })

  app.use('/users', service)

  app
    .service('users')
    .hooks({
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
        update: [disallow()],
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
          assignUserRole,
          sendConfirmationEmail,
          verifyHooks.removeVerification(),
          iff(
            isProvider('external'),
            localHooks.protect('password', 'origin', 'baseurl')
          )
        ],
        patch: [],
        remove: []
      },
      error: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: []
      }
    })
    .hooks({
      after: {
        all: [filterAllowedFields]
      }
    })
}
