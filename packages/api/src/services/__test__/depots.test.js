import _ from 'lodash'

import appLauncher from '../../app'
import { depotData, insertDepot } from './data/depots'
import { createTestUser } from './data/users'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup'

// disable auth
jest.mock('../../hooks/authorization')
jest.mock('../../hooks/email')

describe('depots service', () => {
  let app
  beforeAll(async () => {
    await setupIntegrationTestDb()
    app = appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString
      }
    })
  })
  afterEach(async () => {
    await truncateTestDb()
  })

  const params = { provider: 'rest', headers: {}, query: {} }

  it('gets registered', () => {
    expect(app.service('depots')).toBeTruthy()
  })

  it('finds depots', async () => {
    const depots = await Promise.all(_.times(3, insertDepot))

    const result = await app.service('depots').find(params)

    expect(result.features).toHaveLength(3)
    depots.forEach((depot) => {
      const feature = result.features.find((f) => f.properties.id === depot.id)
      expect(feature.properties.name).toEqual(depot.name)
      expect(feature.properties.city).toEqual(depot.city)
      expect(feature.geometry.coordinates[0]).toEqual(depot.longitude)
      expect(feature.geometry.coordinates[1]).toEqual(depot.latitude)
    })
  })

  it('gets a depot', async () => {
    const depot = await insertDepot()

    const feature = await app.service('depots').get(depot.id, params)

    expect(feature.properties.name).toEqual(depot.name)
    expect(feature.properties.city).toEqual(depot.city)
    expect(feature.geometry.coordinates[0]).toEqual(depot.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(depot.latitude)
    // TODO doesn't work in console??
    // expect(feature.properties.address).toEqual(depot.address)
    // expect(feature.properties.description).toEqual(depot.description)
    // expect(feature.properties.deliveryDays).toEqual(depot.deliveryDays)
  })

  xit('creates a depot', async () => {
    params.user = await createTestUser(app.service('users'))

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
    params.user = await createTestUser(app.service('users'))

    const testDepot = await insertDepot()
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

  it('disallows update', async () => {
    await expect(
      app.service('depots').update(1, {}, params)
    ).rejects.toBeInstanceOf(Error)
  })

  it('removes a depot', async () => {
    params.user = await createTestUser(app.service('users'))

    const testDepot = await insertDepot()

    const feature = await app.service('depots').remove(testDepot.id, params)
    expect(feature.properties.name).toEqual(testDepot.name)
    expect(feature.properties.city).toEqual(testDepot.city)
    expect(feature.geometry.coordinates[0]).toEqual(testDepot.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(testDepot.latitude)
    // TODO doesn't work in console??
    // expect(result.address).toEqual(testDepot.address)
    // expect(result.description).toEqual(testDepot.description)
    // expect(result.deliveryDays).toEqual(testDepot.deliveryDays)

    await expect(
      app.service('depots').get(testDepot.id, params)
    ).rejects.toBeInstanceOf(Error)
  })
})
