import { MethodNotAllowed, BadRequest } from '@feathersjs/errors'
import uuid from 'uuid/v4'
import _ from 'lodash'

import app from '../../app'
import { truncateTestDatabase } from '../../../db/index'
import { sendConfirmationEmail } from '../../hooks/email'

jest.mock('../../hooks/email')

//disable auth
jest.mock('../../hooks/authorization')

describe('users service', () => {
  const service = app.service('users')

  it('gets registered', async () => {
    expect(service).toBeTruthy()
  })

  const params = { provider: 'rest', headers: {} }
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
    const data = () => ({
      email: `${uuid()}@teikei.com`,
      name: 'Guest',
      phone: '1234',
      password: 'guest'
    })
    it('stores the user', async () => {
      const user = data()
      const result = await service.create(user, params)
      expect(result).not.toBeNull()
      expect(result.email).toEqual(user.email)
      expect(result.name).toEqual(user.name)
      expect(result.phone).toEqual(user.phone)
    })
    it('generates a hashed password', async () => {
      const user = data()
      const result = await service.create(user, params)

      const internal = await service.get(result.id)
      expect(internal.password).toBeTruthy()
      expect(internal.password).not.toEqual(user.password)
    })
    it('triggers a confirmation email', async () => {
      const user = data()
      await service.create(user, params)
      expect(sendConfirmationEmail).toHaveBeenCalled()
    })
    it('sets user origin and verification info', async () => {
      const user = data()
      const result = await service.create(user, {
        ...params,
        headers: { origin: 'teikei.com' }
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
      const user = data()
      const result = await service.create(user, params)
      expect(result.createdAt).not.toBeNull()
    })
    it('disallows creating users with existing email', async () => {
      const user = data()
      await service.create(user, params)

      await expect(service.create(user, params)).rejects.toThrow(BadRequest)
    })
    it("doesn't expose the password and internal fields", async () => {
      const user = data()
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
  })
  afterAll(() => truncateTestDatabase())
})
