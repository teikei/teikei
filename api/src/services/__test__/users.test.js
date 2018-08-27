import {
  MethodNotAllowed,
  BadRequest,
  NotAuthenticated
} from '@feathersjs/errors'
import uuid from 'uuid/v4'
import _ from 'lodash'

import app from '../../app'
import { truncateTestDatabase } from '../../../db/index'
import { sendConfirmationEmail } from '../../hooks/email'

jest.mock('../../hooks/email')

// disable auth
jest.mock('../../hooks/authorization')

describe('users service', () => {
  const service = app.service('users')

  it('gets registered', () => {
    expect(service).toBeTruthy()
  })

  const params = { provider: 'rest', headers: {} }

  const newUserData = () => ({
    email: `${uuid()}@teikei.com`,
    name: 'Guest',
    phone: '1234',
    password: 'guest'
  })

  it('disallows find', async () => {
    await expect(service.find(params)).rejects.toThrow(MethodNotAllowed)
  })

  it('disallows get', async () => {
    await expect(service.get(1, params)).rejects.toThrow(MethodNotAllowed)
  })

  it('disallows update', async () => {
    await expect(service.update(1, {}, params)).rejects.toThrow(
      MethodNotAllowed
    )
  })

  it('disallows remove', async () => {
    await expect(service.remove(1, params)).rejects.toThrow(MethodNotAllowed)
  })

  describe('creates users', () => {
    it('stores the user', async () => {
      const user = newUserData()
      const result = await service.create(user, params)
      expect(result).not.toBeNull()
      expect(result.email).toEqual(user.email)
      expect(result.name).toEqual(user.name)
      expect(result.phone).toEqual(user.phone)
    })

    it('generates a hashed password', async () => {
      const user = newUserData()
      const result = await service.create(user, params)

      const internal = await service.get(result.id)
      expect(internal.password).toBeTruthy()
      expect(internal.password).not.toEqual(user.password)
    })

    it('triggers a confirmation email', async () => {
      const user = newUserData()
      await service.create(user, params)
      expect(sendConfirmationEmail).toHaveBeenCalled()
    })

    it('sets user origin and verification info', async () => {
      const user = newUserData()
      const result = await service.create(user, {
        ...params,
        headers: {
          origin: 'teikei.com'
        }
      })

      const internal = await service.get(result.id)
      expect(internal.origin).toEqual('teikei.com')
      expect(internal.isVerified).toEqual(false)
      expect(internal.verifyExpires).not.toBeNull()
      expect(internal.verifyToken).not.toBeNull()
      expect(internal.verifyShortToken).not.toBeNull()
      expect(internal.verifyChanges).not.toBeNull()
    })

    it('sets a createdAt timestamp', async () => {
      const user = newUserData()
      const result = await service.create(user, params)
      expect(result.createdAt).not.toBeNull()
    })

    it('disallows creating users with existing email', async () => {
      const user = newUserData()
      await service.create(user, params)

      await expect(service.create(user, params)).rejects.toThrow(BadRequest)
    })

    it("doesn't expose the password and internal fields", async () => {
      const user = newUserData()
      const result = await service.create(user, params)

      const protectedFields = [
        'password',
        'origin',
        'baseurl',
        'verifyExpires',
        'verifyToken',
        'verifyShortToken'
      ]
      protectedFields.forEach(p => expect(_.keys(result)).not.toContain(p))
    })
  })
  describe('patches users', () => {
    const patch = () => ({
      name: 'new name',
      phone: 'new phone',
      email: `new${uuid()}@teikei.com`
    })

    const createTestUser = async () => {
      const user = newUserData()
      const { id } = await service.create(user, params)
      return service.get(id)
    }

    it('patches the user if a valid passowrd is provided', async () => {
      const testUser = await createTestUser()

      const result = await service.patch(
        testUser.id,
        { ...patch(), password: 'guest' },
        { ...params, user: testUser }
      )

      _.keys(patch).map(k => expect(result[k]).toEqual(patch[k]))
    })
    it('disallows patching the user if an invalid password is provided', async () => {
      const testUser = await createTestUser()

      await expect(
        service.patch(
          testUser.id,
          { ...patch(), password: 'wrongpassword' },
          { ...params, user: testUser }
        )
      ).rejects.toThrow(NotAuthenticated)
    })

    it('sets an updatedAt timestamp', async () => {
      const testUser = await createTestUser()

      const result = await service.patch(
        testUser.id,
        { ...patch(), password: 'guest' },
        { ...params, user: testUser }
      )

      expect(result.createdAt).not.toBeNull()
    })

    const protectedFields = [
      'isVerified',
      'verifyToken',
      'verifyShortToken',
      'verifyExpires',
      'verifyChanges',
      'resetToken',
      'resetShortToken',
      'resetExpires'
    ]

    protectedFields.forEach(protectedField => {
      it(`disallows patching ${protectedField}`, async () => {
        const testUser = await createTestUser()

        await expect(
          service.patch(
            testUser.id,
            { ...patch(), password: 'guest', [protectedField]: 'something' },
            { ...params, user: testUser }
          )
        ).rejects.toThrow(BadRequest)
      })
    })
  })

  afterAll(async () => truncateTestDatabase())
})
