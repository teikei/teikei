import authentication, { hooks as authHooks } from '@feathersjs/authentication'
import { hooks as verifyHooks } from 'feathers-authentication-management'
import local, { hooks as localHooks } from '@feathersjs/authentication-local'
import jwt from '@feathersjs/authentication-jwt'

import {
  addUserRolesToJwtPayload,
  addUserInfoToResponse,
} from '../hooks/authentication'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { addAbilitiesToResponse } from '../hooks/authorization'

export default (app) => {
  const config = app.get('authentication')
  app.configure(authentication(config))

  app.configure(
    local({
      path: '/authentication',
      name: 'local',
      entity: 'user',
      service: 'users',
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
      session: false,
    })
  )
  app.configure(
    jwt({
      name: 'jwt',
      entity: 'user',
      service: 'users',
      passReqToCallback: true,
      header: 'Authorization',
      secretOrKey: config.secret,
      session: false,
    })
  )

  app
    .service('authentication')
    .hooks({
      before: {
        all: [],
        create: [
          authHooks.authenticate(['local', 'jwt']),
          verifyHooks.isVerified(),
          addUserRolesToJwtPayload,
        ],
        remove: [authHooks.authenticate('jwt')],
      },
      after: {
        all: [],
        create: [
          addUserInfoToResponse,
          addAbilitiesToResponse,
          localHooks.protect('password'),
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
