import app from '../../app'

// disable auth
jest.mock('../../hooks/authorization')

describe('authentication service', () => {
  const service = app.service('authentication')

  it('gets registered', () => {
    expect(service).toBeTruthy()
  })

  const params = { provider: 'rest', headers: {} }

  it('has no find method', () => {
    expect(service.find).toEqual(undefined)
  })

  it('has no get method', () => {
    expect(service.get).toEqual(undefined)
  })

  it('has no update method', () => {
    expect(service.update).toEqual(undefined)
  })

  it('has no patch method', () => {
    expect(service.patch).toEqual(undefined)
  })

  describe('creates authentications', () => {
    // TODO
    // it('creates an authentication if valid credentials are provided', async () => {
    //   const result = await service.create(
    //     {
    //       user: 'admin@teikei.com',
    //       password: 'admin'
    //     },
    //     params
    //   )
    //   expect(result).not.toBeNull()
    // })
  })

  describe('removes authentications', () => {
    // TODO
  })
})
