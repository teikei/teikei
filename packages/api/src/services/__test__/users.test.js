import { v4 as uuid } from 'uuid'
import _ from 'lodash'

import appLauncher from '../../app'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb,
} from '../../../db/integrationTestSetup'
import { sendConfirmationEmail } from '../../hooks/email'
import { createTestUser, newUserData } from './data/users'

jest.mock('../../hooks/email')

// disable auth
jest.mock('../../hooks/authorization')

describe('users service', () => {
  let app
  beforeAll(async () => {
    await setupIntegrationTestDb()
    app = appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString,
      },
    })
  })
  afterEach(async () => {
    await truncateTestDb()
  })

  it('gets registered', () => {
    expect(app.service('users')).toBeTruthy()
  })

  const params = { provider: 'rest', headers: {}, query: {} }

  it('disallows find', async () => {
    expect(app.service('users').find(params)).rejects.toBeInstanceOf(Error)
  })

  it.skip('disallows get', async () => {
    expect(app.service('users').get(1, params)).rejects.toBeInstanceOf(Error)
  })

  it('disallows update', async () => {
    expect(app.service('users').update(1, {}, params)).rejects.toBeInstanceOf(
      Error
    )
  })

  it('disallows remove', async () => {
    expect(app.service('users').remove(1, params)).rejects.toBeInstanceOf(Error)
  })

  describe('creates users', () => {
    it('stores the user', async () => {
      const user = {
        email: `${uuid()}@example.com`,
        name: 'Guest',
        phone: '1234',
        password: 'guest',
      }
      const result = await app.service('users').create(user, params)
      expect(result).not.toBeNull()
      expect(result.email).toEqual(user.email)
      expect(result.name).toEqual(user.name)
      expect(result.phone).toEqual(user.phone)
    })

    it.skip('generates a hashed password', async () => {
      const user = newUserData()
      const result = await app.service('users').create(user, params)

      const internal = await app.service('users').get(result.id)
      expect(internal.password).toBeTruthy()
      expect(internal.password).not.toEqual(user.password)
    })

    it('triggers a confirmation email', async () => {
      const user = newUserData()
      await app.service('users').create(user, params)
      expect(sendConfirmationEmail).toHaveBeenCalled()
    })

    it('sets user origin and verification info', async () => {
      const user = newUserData()
      const result = await app.service('users').create(user, {
        ...params,
        headers: {
          origin: 'teikei.com',
        },
      })

      const internal = await app.service('users').get(result.id)
      expect(internal.origin).toEqual('teikei.com')
      expect(internal.isVerified).toEqual(false)
      expect(internal.verifyExpires).not.toBeNull()
      expect(internal.verifyToken).not.toBeNull()
      expect(internal.verifyShortToken).not.toBeNull()
      expect(internal.verifyChanges).not.toBeNull()
    })

    it('sets a createdAt timestamp', async () => {
      const user = newUserData()
      const result = await app.service('users').create(user, params)
      expect(result.createdAt).not.toBeNull()
    })

    it('disallows creating users with existing email', async () => {
      const user = newUserData()
      const result = await app.service('users').create(user, params)
      expect(result).not.toBeNull()

      await expect(
        app.service('users').create(user, params)
      ).rejects.toBeInstanceOf(Error)
    })

    it("doesn't expose the password and internal fields", async () => {
      const user = newUserData()
      const result = await app.service('users').create(user, params)

      const protectedFields = [
        'password',
        'origin',
        'baseurl',
        'verifyExpires',
        'verifyToken',
        'verifyShortToken',
      ]
      protectedFields.forEach((p) => expect(_.keys(result)).not.toContain(p))
    })
  })
  describe('patches users', () => {
    const patch = () => ({
      name: 'new name',
      phone: 'new phone',
      email: `new${uuid()}@teikei.com`,
    })

    it.skip('patches the user if a valid passowrd is provided', async () => {
      const testUser = await createTestUser(app.service('users'), params)

      const result = await app
        .service('users')
        .patch(
          testUser.id,
          { ...patch(), password: 'guest' },
          { ...params, user: testUser }
        )

      _.keys(patch).map((k) => expect(result[k]).toEqual(patch[k]))
    })
    it('disallows patching the user if an invalid password is provided', async () => {
      const testUser = await createTestUser(app.service('users'), params)

      expect(
        app
          .service('users')
          .patch(
            testUser.id,
            { ...patch(), password: 'wrongpassword' },
            { ...params, user: testUser }
          )
      ).rejects.toBeInstanceOf(Error)
    })

    it.skip('sets an updatedAt timestamp', async () => {
      const testUser = await createTestUser(app.service('users'), params)
      const result = await app
        .service('users')
        .patch(
          testUser.id,
          { ...patch(), password: 'guest' },
          { ...params, user: testUser }
        )
      expect(result.updatedAt).not.toBeNull()
    })

    const protectedFields = [
      'isVerified',
      'verifyToken',
      'verifyShortToken',
      'verifyExpires',
      'verifyChanges',
      'resetToken',
      'resetAttempts',
      'resetShortToken',
      'resetExpires',
    ]

    protectedFields.forEach((protectedField) => {
      it(`disallows patching ${protectedField}`, async () => {
        const testUser = await createTestUser(app.service('users'), params)

        expect(
          app
            .service('users')
            .patch(
              testUser.id,
              { ...patch(), password: 'guest', [protectedField]: 'something' },
              { ...params, user: testUser }
            )
        ).rejects.toBeInstanceOf(Error)
      })
    })
  })
})
