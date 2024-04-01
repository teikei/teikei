import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { BadRequest } from '@feathersjs/errors'

import filterAllowedFields from '../hooks/filterAllowedFields'
import { resetUserLoginActivityState } from '../hooks/userAccountActions'

class UserRolesAuthenticationService extends AuthenticationService {
  async getPayload(authResult, params) {
    const payload = await super.getPayload(authResult, params)
    const { user } = authResult
    // add roles to payload
    return Object.assign(payload, { roles: user && user.roles })
  }
}

export const restrictAuthenticationResponse = async (ctx) => {
  const {
    accessToken,
    user: { id, email, name, phone },
  } = ctx.result
  ctx.result = { accessToken, user: { id, email, name, phone } }
  return ctx
}

export default (app) => {
  const authService = new UserRolesAuthenticationService(app)
  authService.register('jwt', new JWTStrategy())
  authService.register('local', new LocalStrategy())

  app.use('/authentication', authService)
  app.service('authentication').hooks({
    after: {
      create: [
        async (ctx) => {
          if (!ctx.result.user || !ctx.result.user.isVerified) {
            throw new BadRequest("User's email is not yet verified.")
          }
        },
        async (ctx) => resetUserLoginActivityState(app, ctx.result.user.id),
        restrictAuthenticationResponse,
        filterAllowedFields,
      ],
      remove: [filterAllowedFields],
    },
  })
}
