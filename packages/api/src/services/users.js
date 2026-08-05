import { hooks as localHooks } from '@feathersjs/authentication-local'
import { Forbidden } from '@feathersjs/errors'
import { hooks as verifyHooks } from 'feathers-authentication-management'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import createService from 'feathers-objection'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit.js'
import { sendConfirmationEmail } from '../hooks/email.js'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import { withEager } from '../hooks/relations.js'
import {
  assignUserRole,
  protectUserFieldChanges,
  protectUserFields,
  restrictUserPatchFields,
  setOrigin,
  validateUserPassword
} from '../hooks/user.js'
import {
  convertVerifyDatesFromISOStrings,
  convertVerifyDatesToISOStrings
} from '../hooks/verify.js'
import User from '../models/users.js'
import { errorCodes, withErrorCode } from '../utils/errorCodes.js'

export default (app) => {
  const service = createService({
    model: User,
    whitelist: ['$eager'],
    allowedEager: '[roles,adminOrigins]'
  })

  app.use('/users', service)

  app.service('users').hooks({
    before: {
      find: [disallow('external')],
      get: [
        // make sure user is requesting their own data only
        iff(isProvider('external'), (ctx) => {
          if (!ctx.params.user || ctx.id !== ctx.params.user.id) {
            throw withErrorCode(
              new Forbidden('Access to user info forbidden'),
              errorCodes.FORBIDDEN
            )
          }
        }),
        withEager('[roles,adminOrigins]')
      ],
      create: [
        setOrigin,
        localHooks.hashPassword('password'),
        verifyHooks.addVerification(),
        convertVerifyDatesToISOStrings,
        setCreatedAt
      ],
      update: [disallow()],
      patch: [
        validateUserPassword,
        protectUserFieldChanges,
        restrictUserPatchFields,
        convertVerifyDatesToISOStrings,
        setUpdatedAt
      ],
      remove: [disallow('external')]
    },
    after: {
      find: [protectUserFields, filterAllowedFields],
      get: [
        convertVerifyDatesFromISOStrings,
        protectUserFields,
        filterAllowedFields
      ],
      create: [
        assignUserRole,
        sendConfirmationEmail,
        verifyHooks.removeVerification(),
        iff(
          isProvider('external'),
          localHooks.protect('password', 'origin', 'baseurl')
        ),
        protectUserFields,
        filterAllowedFields
      ],
      patch: [protectUserFields, filterAllowedFields],
      remove: [protectUserFields, filterAllowedFields]
    }
  })
}
