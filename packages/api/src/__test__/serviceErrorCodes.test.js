import { feathers } from '@feathersjs/feathers'
import bcrypt from 'bcryptjs'
import defaultConfig from '../../config/default.json'
import { authorize } from '../hooks/authorization'
import { validateUserPassword } from '../hooks/user'
import authenticationService from '../services/authentication'
import userReactivationService from '../services/userReactivation'
import usersService from '../services/users'
import { errorCodes } from '../utils/errorCodes'

const CORRECT_PASSWORD = 'correct horse battery staple'

// jwt-decode does not verify signatures, and `extractRolesFromJwtToken` only
// reads the payload — so an unsigned token is enough to drive `authorize`.
const tokenWithRoles = (...roles) => {
  const payload = Buffer.from(
    JSON.stringify({ roles: roles.map((name) => ({ name })) })
  ).toString('base64url')
  return `header.${payload}.signature`
}

const buildAuthApp = (users) => {
  const app = feathers()
  app.set('authentication', defaultConfig.authentication)
  app.use('/users', {
    id: 'id',
    async find() {
      return users
    }
  })
  authenticationService(app)
  return app
}

const signIn = async (app, data) => {
  try {
    await app.service('authentication').create(data)
  } catch (error) {
    return error
  }
  throw new Error('expected sign-in to fail')
}

describe('authentication error codes', () => {
  it('pins the local strategy error message in config', () => {
    expect(defaultConfig.authentication.local.errorMessage).toBe(
      'Invalid login'
    )
  })

  it('codes a wrong password as INVALID_CREDENTIALS', async () => {
    const app = buildAuthApp([
      {
        id: 1,
        email: 'someone@example.com',
        password: bcrypt.hashSync(CORRECT_PASSWORD, 10),
        isVerified: true
      }
    ])

    const error = await signIn(app, {
      strategy: 'local',
      email: 'someone@example.com',
      password: 'wrong password'
    })

    expect(error.code).toBe(401)
    expect(error.message).toBe('Invalid login')
    expect(error.toJSON().data.errorCode).toBe(errorCodes.INVALID_CREDENTIALS)
  })

  it('codes an unregistered email as INVALID_CREDENTIALS', async () => {
    const error = await signIn(buildAuthApp([]), {
      strategy: 'local',
      email: 'nobody@example.com',
      password: CORRECT_PASSWORD
    })

    expect(error.code).toBe(401)
    expect(error.toJSON().data.errorCode).toBe(errorCodes.INVALID_CREDENTIALS)
  })

  // Anti-enumeration: an attacker must not be able to tell a registered address
  // from an unregistered one. errorHandler serializes toJSON() verbatim, so
  // equal serializations mean equal response bodies.
  it('returns byte-identical bodies for unknown email and wrong password', async () => {
    const unknownEmail = await signIn(buildAuthApp([]), {
      strategy: 'local',
      email: 'nobody@example.com',
      password: CORRECT_PASSWORD
    })
    const wrongPassword = await signIn(
      buildAuthApp([
        {
          id: 1,
          email: 'someone@example.com',
          password: bcrypt.hashSync(CORRECT_PASSWORD, 10),
          isVerified: true
        }
      ]),
      {
        strategy: 'local',
        email: 'someone@example.com',
        password: 'wrong password'
      }
    )

    expect(JSON.stringify(unknownEmail.toJSON())).toBe(
      JSON.stringify(wrongPassword.toJSON())
    )
  })

  it('codes an unverified account as EMAIL_NOT_VERIFIED', async () => {
    const app = buildAuthApp([
      {
        id: 1,
        email: 'unverified@example.com',
        password: bcrypt.hashSync(CORRECT_PASSWORD, 10),
        isVerified: false
      }
    ])

    const error = await signIn(app, {
      strategy: 'local',
      email: 'unverified@example.com',
      password: CORRECT_PASSWORD
    })

    expect(error.code).toBe(400)
    expect(error.toJSON().data.errorCode).toBe(errorCodes.EMAIL_NOT_VERIFIED)
  })

  it('leaves a failed jwt re-authentication uncoded', async () => {
    const error = await signIn(buildAuthApp([]), {
      strategy: 'jwt',
      accessToken: 'not-a-token'
    })

    expect(error.toJSON().data?.errorCode).toBeUndefined()
  })
})

describe('password verification error codes', () => {
  const patchContext = (data) => ({
    data,
    params: {
      provider: 'rest',
      user: { id: 1, password: bcrypt.hashSync(CORRECT_PASSWORD, 10) }
    }
  })

  it('codes a missing password as PASSWORD_REQUIRED', async () => {
    await expect(validateUserPassword(patchContext({}))).rejects.toMatchObject({
      code: 401,
      data: { errorCode: errorCodes.PASSWORD_REQUIRED }
    })
  })

  it('codes a wrong password as PASSWORD_INCORRECT', async () => {
    await expect(
      validateUserPassword(patchContext({ password: 'wrong password' }))
    ).rejects.toMatchObject({
      code: 401,
      data: { errorCode: errorCodes.PASSWORD_INCORRECT }
    })
  })
})

describe('authorization error codes', () => {
  it('codes a missing scope as FORBIDDEN', async () => {
    await expect(
      authorize({
        method: 'create',
        path: 'farms',
        params: { headers: {} }
      })
    ).rejects.toMatchObject({
      code: 403,
      data: { errorCode: errorCodes.FORBIDDEN }
    })
  })

  // The `users` get hook guards its own throw site. It runs before any query,
  // so the service never reaches the database here.
  it('codes reading another user as FORBIDDEN', async () => {
    const app = feathers()
    usersService(app)

    await expect(
      app.service('users').get(1, { provider: 'rest', user: { id: 2 } })
    ).rejects.toMatchObject({
      code: 403,
      data: { errorCode: errorCodes.FORBIDDEN }
    })
  })

  it('codes writing a forbidden field as FORBIDDEN_FIELDS', async () => {
    await expect(
      authorize({
        method: 'create',
        path: 'farms',
        params: { headers: { authorization: tokenWithRoles('user') } },
        data: { name: 'Test farm', ownerships: 'not writable' }
      })
    ).rejects.toMatchObject({
      code: 403,
      data: { errorCode: errorCodes.FORBIDDEN_FIELDS }
    })
  })
})

describe('user reactivation error codes', () => {
  const buildReactivationApp = (user) => {
    const registry = {
      users: {
        async get() {
          return user
        }
      }
    }
    const app = {
      use: (path, service) => {
        registry[path.replace(/^\//, '')] = Object.assign(service, {
          hooks: () => {}
        })
      },
      service: (path) => registry[path.replace(/^\//, '')]
    }
    userReactivationService(app)
    return app
  }

  it('codes a mismatching token as REACTIVATION_TOKEN_INVALID', async () => {
    const app = buildReactivationApp({
      reactivationToken: 'the-real-token',
      state: 'INACTIVE'
    })

    await expect(
      app.service('user-reactivation').create({ id: 1, token: 'wrong-token' })
    ).rejects.toMatchObject({
      code: 400,
      data: { errorCode: errorCodes.REACTIVATION_TOKEN_INVALID }
    })
  })
})
