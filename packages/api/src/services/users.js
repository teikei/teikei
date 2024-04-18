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
  protectUserFieldChanges
} from '../hooks/user'
import {
  convertVerifyDatesFromISOStrings,
  convertVerifyDatesToISOStrings
} from '../hooks/verify'
import { sendConfirmationEmail } from '../hooks/email'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { withEager } from '../hooks/relations'
import { Forbidden } from '@feathersjs/errors'

export default (app) => {
  const service = createService({
    model: User,
    whitelist: ['$eager'],
    allowedEager: 'roles'
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
        withEager('roles') // TODO: limit to current user
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
