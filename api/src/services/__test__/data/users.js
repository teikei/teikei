/* eslint-disable import/no-extraneous-dependencies */
import uuid from 'uuid/v4'

export const newUserData = () => ({
  email: `${uuid()}@teikei.com`,
  name: 'Guest',
  phone: '1234',
  password: 'guest'
})

// TODO create with objection (and hashed password) instead of users service?
export const createTestUser = async service => {
  const user = newUserData()
  const { id } = await service.create(user, { headers: {} })
  return service.get(id)
}
