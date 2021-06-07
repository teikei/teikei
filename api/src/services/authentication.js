import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import errors from '@feathersjs/errors'

import filterAllowedFields from '../hooks/filterAllowedFields'
import { addAbilitiesToResponse } from '../hooks/authorization'

class UserRolesAuthenticationService extends AuthenticationService {
  async getPayload(authResult, params) {
    const payload = await super.getPayload(authResult, params)
    const { user } = authResult
    // add roles to payload
    return Object.assign(payload, { roles: user && user.roles })
  }
}

export default (app) => {
  const authService = new UserRolesAuthenticationService(app)
  authService.register('jwt', new JWTStrategy())
  authService.register('local', new LocalStrategy())

  app.use('/authentication', authService)
  app
    .service('authentication')
    .hooks({
      before: {
        all: [],
        create: [],
        remove: [],
      },
      after: {
        all: [],
        create: [
          (ctx) => {
            if (!ctx.result.user || !ctx.result.user.isVerified) {
              throw new errors.BadRequest("User's email is not yet verified.")
            }
          },
          addAbilitiesToResponse,
        ],
        remove: [addAbilitiesToResponse],
      },
      error: {
        all: [],
        create: [],
        remove: [],
      },
    })
    .hooks({
      after: {
        all: [filterAllowedFields],
      },
    })
}
