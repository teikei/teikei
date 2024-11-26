import { hooks as localHooks } from '@feathersjs/authentication-local'
import { hooks as verifyHooks } from 'feathers-authentication-management'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import createService from 'feathers-objection'

import { Forbidden } from '@feathersjs/errors'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import { sendConfirmationEmail } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { withEager } from '../hooks/relations'
import {
  assignUserRole,
  protectUserFieldChanges,
  protectUserFields,
  setOrigin,
  validateUserPassword
} from '../hooks/user'
import {
  convertVerifyDatesFromISOStrings,
  convertVerifyDatesToISOStrings
} from '../hooks/verify'
import User from '../models/users'

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
            throw new Forbidden('Access to user info forbidden')
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
