import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb,
} from '../../../db/integrationTestSetup'
import appLauncher from '../../app'

// disable auth
jest.mock('../../hooks/authorization')

describe('authentication service', () => {
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
    expect(app.service('authentication')).toBeTruthy()
  })

  it('has no find method', () => {
    expect(app.service('authentication').find).toEqual(undefined)
  })

  it('has no get method', () => {
    expect(app.service('authentication').get).toEqual(undefined)
  })

  it('has no update method', () => {
    expect(app.service('authentication').update).toEqual(undefined)
  })

  it('has no patch method', () => {
    expect(app.service('authentication').patch).toEqual(undefined)
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
