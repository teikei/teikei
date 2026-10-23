import _ from 'lodash'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.ts'
import { depotData, insertDepot } from './data/depots.js'
import { createTestUser } from './data/users.js'

// disable auth
vi.mock('../../hooks/authorization')
vi.mock('../../hooks/email')

describe('depots service', () => {
  let app
  let db
  beforeAll(async () => {
    await setupIntegrationTestDb()
    app = appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString
      }
    })
    db = app.get('kysely')
  })
  afterEach(async () => {
    await truncateTestDb()
  })

  const params = { provider: 'rest', headers: {}, query: {} }

  it('gets registered', () => {
    expect(app.service('depots')).toBeTruthy()
  })

  it('finds depots', async () => {
    const depots = await Promise.all(_.times(3, () => insertDepot(db)))

    const result = await app.service('depots').find(params)

    expect(result.features).toHaveLength(3)
    depots.forEach((depot) => {
      const feature = result.features.find((f) => f.properties.id === depot.id)
      expect(feature.properties.name).toEqual(depot.name)
      expect(feature.properties.city).toEqual(depot.city)
      expect(feature.geometry.coordinates[0]).toEqual(Number(depot.longitude))
      expect(feature.geometry.coordinates[1]).toEqual(Number(depot.latitude))
    })
  })

  it('gets a depot', async () => {
    const depot = await insertDepot(db)

    const feature = await app.service('depots').get(depot.id, params)

    expect(feature.properties.name).toEqual(depot.name)
    expect(feature.properties.city).toEqual(depot.city)
    expect(feature.geometry.coordinates[0]).toEqual(Number(depot.longitude))
    expect(feature.geometry.coordinates[1]).toEqual(Number(depot.latitude))
    // TODO doesn't work in console??
    // expect(feature.properties.address).toEqual(depot.address)
    // expect(feature.properties.description).toEqual(depot.description)
    // expect(feature.properties.deliveryDays).toEqual(depot.deliveryDays)
  })

  it.skip('creates a depot', async () => {
    params.user = await createTestUser(db)

    const data = await depotData()

    const feature = await app.service('depots').create(data, params)

    expect(feature.properties.name).toEqual(data.name)
    expect(feature.properties.city).toEqual(data.city)
    expect(feature.geometry.coordinates[0]).toEqual(data.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(data.latitude)
    // TODO doesn't work in console??
    // expect(result.address).toEqual(result.address)
    // expect(result.description).toEqual(data.description)
    // expect(result.deliveryDays).toEqual(data.deliveryDays)
  })
  it('patches a depot', async () => {
    params.user = await createTestUser(db)

    const testDepot = await insertDepot(db)
    const data = await depotData()

    const feature = await app
      .service('depots')
      .patch(testDepot.id, data, params)

    expect(feature.properties.name).toEqual(data.name)
    expect(feature.properties.city).toEqual(data.city)
    expect(feature.geometry.coordinates[0]).toEqual(data.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(data.latitude)
    // TODO doesn't work in console??
    // expect(result.address).toEqual(patch.address)
    // expect(result.description).toEqual(patch.description)
    // expect(result.deliveryDays).toEqual(patch.deliveryDays)
  })

  it('has no update method', () => {
    expect(app.service('depots').update).toEqual(undefined)
  })

  it('removes a depot', async () => {
    params.user = await createTestUser(db)

    const testDepot = await insertDepot(db)

    const feature = await app.service('depots').remove(testDepot.id, params)
    expect(feature.properties.name).toEqual(testDepot.name)
    expect(feature.properties.city).toEqual(testDepot.city)
    expect(feature.geometry.coordinates[0]).toEqual(Number(testDepot.longitude))
    expect(feature.geometry.coordinates[1]).toEqual(Number(testDepot.latitude))
    // TODO doesn't work in console??
    // expect(result.address).toEqual(testDepot.address)
    // expect(result.description).toEqual(testDepot.description)
    // expect(result.deliveryDays).toEqual(testDepot.deliveryDays)

    await expect(
      app.service('depots').get(testDepot.id, params)
    ).rejects.toBeInstanceOf(Error)
  })
})
