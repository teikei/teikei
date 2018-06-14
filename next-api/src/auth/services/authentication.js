import authentication, { hooks as authHooks } from '@feathersjs/authentication'
import { hooks as verifyHooks } from 'feathers-authentication-management'
import local from '@feathersjs/authentication-local'
import jwt from '@feathersjs/authentication-jwt'

import { addUserRolesToJwtPayload } from '../hooks/authorization'

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
      create: [
        authHooks.authenticate(['local', 'jwt']),
        verifyHooks.isVerified(),
        addUserRolesToJwtPayload
      ]
    },
    after: {
      create: [
        ctx => {
          ctx.result.user = ctx.params.user
          // Don't expose sensitive information.
          delete ctx.result.user.password
        }
      ]
    }
  })
}
