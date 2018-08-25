import authentication, { hooks as authHooks } from '@feathersjs/authentication'
import { hooks as verifyHooks } from 'feathers-authentication-management'
import local, { hooks as localHooks } from '@feathersjs/authentication-local'
import jwt from '@feathersjs/authentication-jwt'

import addUserRolesToJwtPayload from '../hooks/authentication'

export default app => {
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
      session: false
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
      session: false
    })
  )

  app.service('authentication').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [
        authHooks.authenticate(['local', 'jwt']),
        verifyHooks.isVerified(),
        addUserRolesToJwtPayload
      ],
      update: [],
      patch: [],
      remove: [authHooks.authenticate('jwt')]
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [
        ctx => {
          const { email, name, phone } = ctx.params.user
          ctx.result.user = { email, name, phone }
        },
        localHooks.protect('password')
      ],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
}
