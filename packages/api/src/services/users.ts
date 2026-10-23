// The users service is called by the authentication libraries, by path. The
// calls they make for the actions clients use, from the source of
// @feathersjs/authentication(-local) 5.0.44 and
// feathers-authentication-management 5.1.0, and the app's own callers:
//
//   find   { email, $limit }             LocalStrategy, sendResetPwd,
//                                        passwordChange
//          { verifyToken, $limit }       verifySignupLong
//          { email: { $in }, $limit }    jobs/sendAuditEmail.js
//   get    JWTStrategy (params.user), LocalStrategy, resetPwdLong, the
//          authorize hook, email campaigns; external: the own account
//   create sign-up (external)
//   patch  the verification and reset fields (FAM), the own account
//          (external)
//   remove internal only
//
// Every other find is rejected rather than guessed at.
import { hooks as localHooks } from '@feathersjs/authentication-local'
import { BadRequest, Forbidden } from '@feathersjs/errors'
import type { Application, HookContext, Id, Params } from '@feathersjs/feathers'
import { hooks as verifyHooks } from 'feathers-authentication-management'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createUsersDomain } from '../domain/users.ts'
import { setCreatedAt, setUpdatedAt } from '../hooks/audit.ts'
import { sendConfirmationEmail } from '../hooks/email.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import {
  protectUserFieldChanges,
  protectUserFields,
  restrictUserPatchFields,
  setOrigin,
  validateUserPassword
} from '../hooks/user.ts'
import {
  convertVerifyDatesFromISOStrings,
  convertVerifyDatesToISOStrings
} from '../hooks/verify.ts'
import type { UserChanges } from '../repositories/users.ts'
import { errorCodes, withErrorCode } from '../utils/errorCodes.ts'
import { fromRequest, toUser } from './serializers.ts'

const isEmailList = (value: unknown): value is { $in: string[] } =>
  typeof value === 'object' &&
  value !== null &&
  Object.keys(value).length === 1 &&
  Array.isArray((value as { $in?: unknown }).$in)

const createUsersController = (db: Database) => {
  const users = createUsersDomain(db)

  const find = ({ $limit, ...query }: Params['query'] = {}) => {
    const limit = $limit === undefined ? undefined : Number($limit)
    const [key, ...others] = Object.keys(query)
    if (others.length === 0) {
      const value = query[key]
      if (key === 'email' && typeof value === 'string') {
        return users.findAccountsByEmail(value, limit)
      }
      if (key === 'verifyToken' && typeof value === 'string') {
        return users.findAccountsByVerifyToken(value, limit)
      }
      if (key === 'email' && isEmailList(value)) {
        return users.findByEmails(value.$in, limit)
      }
    }
    throw new BadRequest('Unsupported users query')
  }

  return {
    // The id field the authentication service and FAM read records by.
    id: 'id',
    // Unpaginated, whatever `paginate` says, as all callers expect.
    find: async (params: Params) => (await find(params.query)).map(toUser),
    get: async (id: Id) => toUser(await users.getAccount(String(id))),
    create: async (data: object) =>
      toUser(await users.signUp(fromRequest(data))),
    patch: async (id: Id, data: UserChanges) =>
      toUser(await users.patch(String(id), fromRequest(data))),
    remove: async (id: Id) => toUser(await users.remove(String(id)))
  }
}

export default (app: Application) => {
  // Clients only reach get, create and patch; find and remove answer 405
  // before any hook runs.
  app.use('/users', createUsersController(app.get('kysely')), {
    methods: ['get', 'create', 'patch']
  })

  app.service('users').hooks({
    before: {
      find: [disallow('external')],
      get: [
        // make sure user is requesting their own data only
        iff(isProvider('external'), (ctx: HookContext) => {
          if (!ctx.params.user || ctx.id !== ctx.params.user.id) {
            throw withErrorCode(
              new Forbidden('Access to user info forbidden'),
              errorCodes.FORBIDDEN
            )
          }
        })
      ],
      create: [
        setOrigin,
        localHooks.hashPassword('password'),
        verifyHooks.addVerification(),
        convertVerifyDatesToISOStrings,
        setCreatedAt
      ],
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
    },
    error: { all: [mapDatabaseErrors] }
  })
}
