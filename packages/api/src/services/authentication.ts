import {
  type AuthenticationParams,
  type AuthenticationResult,
  AuthenticationService,
  JWTStrategy
} from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { BadRequest } from '@feathersjs/errors'
import type { Application, HookContext } from '@feathersjs/feathers'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import { recordLogin, setAccountActive } from '../hooks/userAccountActions.ts'
import { errorCodes, withErrorCode } from '../utils/errorCodes.ts'

class UserRolesAuthenticationService extends AuthenticationService {
  async getPayload(
    authResult: AuthenticationResult,
    params: AuthenticationParams
  ) {
    const payload = await super.getPayload(authResult, params)
    const { user } = authResult
    // add roles to payload
    return Object.assign(payload, { roles: user && user.roles })
  }
}

// LocalStrategy throws its `NotAuthenticated` inside the library, so the code
// can only be attached afterwards. Unknown email and wrong password both land
// here with the same message and the same code — splitting them would allow
// account enumeration.
export const codeLocalStrategyFailure = async (ctx: HookContext) => {
  if (ctx.data.strategy === 'local' && ctx.error.name === 'NotAuthenticated') {
    withErrorCode(ctx.error, errorCodes.INVALID_CREDENTIALS)
  }
  return ctx
}

export const restrictAuthenticationResponse = async (ctx: HookContext) => {
  const {
    accessToken,
    user: { id, email, name, phone, locale }
  } = ctx.result
  ctx.result = { accessToken, user: { id, email, name, phone, locale } }
  return ctx
}

export default (app: Application) => {
  const authService = new UserRolesAuthenticationService(app)
  authService.register('jwt', new JWTStrategy())
  authService.register('local', new LocalStrategy())

  app.use('/authentication', authService)
  app.service('authentication').hooks({
    after: {
      create: [
        async (ctx) => {
          if (!ctx.result.user || !ctx.result.user.isVerified) {
            throw withErrorCode(
              new BadRequest("User's email is not yet verified."),
              errorCodes.EMAIL_NOT_VERIFIED
            )
          }
        },
        async (ctx) => {
          const { id, active } = ctx.result.user
          if (!active) {
            await setAccountActive(app, id, true)
          }
          await recordLogin(app, id)
        },
        restrictAuthenticationResponse,
        filterAllowedFields
      ],
      remove: [filterAllowedFields]
    },
    error: {
      create: [codeLocalStrategyFailure]
    }
  })
}
