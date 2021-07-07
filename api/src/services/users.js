import createService from 'feathers-objection'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import { hooks as localHooks } from '@feathersjs/authentication-local'
import { hooks as verifyHooks } from 'feathers-authentication-management'

import User from '../models/users'
import {
  setOrigin,
  assignUserRole,
  protectUserFields,
  validateUserPassword,
  protectUserFieldChanges,
} from '../hooks/user'
import {
  convertVerifyDatesFromISOStrings,
  convertVerifyDatesToISOStrings,
} from '../hooks/verify'
import { sendConfirmationEmail } from '../hooks/email'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { withEager } from '../hooks/relations'

export default (app) => {
  const service = createService({
    model: User,
    whitelist: ['$eager'],
    allowedEager: 'roles',
  })

  app.use('/users', service)

  app
    .service('users')
    .hooks({
      before: {
        all: [],
        find: [disallow('external')],
        get: [
          (ctx) => {
            // make sure user is requesting their own data only
            if (!ctx.params.user || ctx.id !== ctx.params.user.id) {
              return null
            }
          },
          withEager('roles'), // TODO: limit to current user
        ],
        create: [
          setOrigin,
          localHooks.hashPassword('password'),
          verifyHooks.addVerification(),
          convertVerifyDatesToISOStrings,
          setCreatedAt,
        ],
        update: [disallow()],
        patch: [
          validateUserPassword,
          protectUserFieldChanges,
          convertVerifyDatesToISOStrings,
          setUpdatedAt,
        ],
        remove: [disallow('external')],
      },
      after: {
        all: [],
        find: [protectUserFields],
        get: [convertVerifyDatesFromISOStrings, protectUserFields],
        create: [
          assignUserRole,
          sendConfirmationEmail,
          verifyHooks.removeVerification(),
          iff(
            isProvider('external'),
            localHooks.protect('password', 'origin', 'baseurl')
          ),
          protectUserFields,
        ],
        patch: [protectUserFields],
        remove: [protectUserFields],
      },
      error: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: [],
      },
    })
    .hooks({
      after: {
        all: [filterAllowedFields],
      },
    })
}
