import app from '../../app'

describe('users service', () => {
  it('registers the service', async () => {
    const service = app.service('users')
    expect(service).toBeTruthy()
  })

  it('gets user 1', async () => {
    const service = app.service('users')

    const result = await service.get(1)
    expect(result).not.toBeNull()
  })
})
