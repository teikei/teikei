import _ from 'lodash'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.js'
import { initiativeData, insertInitiative } from './data/initiatives.js'
import { createTestUser } from './data/users.js'

// disable auth
vi.mock('../../hooks/authorization')
vi.mock('../../hooks/email')

describe('initiatives service', () => {
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
    expect(app.service('initiatives')).toBeTruthy()
  })

  it('finds initiatives', async () => {
    const initiatives = await Promise.all(
      _.times(3, () => insertInitiative(db))
    )

    const result = await app.service('initiatives').find(params)
    expect(result.features).toHaveLength(3)
    initiatives.forEach((initiative) => {
      const feature = result.features.find(
        (f) => f.properties.id === initiative.id
      )
      expect(feature.properties.name).toEqual(initiative.name)
      expect(feature.properties.city).toEqual(initiative.city)
      expect(feature.geometry.coordinates[0]).toEqual(
        Number(initiative.longitude)
      )
      expect(feature.geometry.coordinates[1]).toEqual(
        Number(initiative.latitude)
      )
    })
  })

  it('gets a initiative', async () => {
    const testInitiative = await insertInitiative(db)

    const feature = await app
      .service('initiatives')
      .get(testInitiative.id, params)

    expect(feature.properties.name).toEqual(testInitiative.name)
    expect(feature.properties.city).toEqual(testInitiative.city)
    expect(feature.geometry.coordinates[0]).toEqual(
      Number(testInitiative.longitude)
    )
    expect(feature.geometry.coordinates[1]).toEqual(
      Number(testInitiative.latitude)
    )
    // TODO doesn't work in console??
    // expect(feature.properties.address).toEqual(testInitiative.address)
    // expect(feature.properties.description).toEqual(testInitiative.description)
    // expect(feature.properties.deliveryDays).toEqual(testInitiative.deliveryDays)
  })

  it('creates a initiative', async () => {
    params.user = await createTestUser(db)

    const data = await initiativeData()

    const feature = await app.service('initiatives').create(data, params)

    expect(feature.properties.name).toEqual(data.name)
    expect(feature.properties.city).toEqual(data.city)
    expect(feature.geometry.coordinates[0]).toEqual(data.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(data.latitude)
    // TODO doesn't work in console??
    // expect(result.address).toEqual(result.address)
    // expect(result.description).toEqual(data.description)
    // expect(result.deliveryDays).toEqual(data.deliveryDays)
  })
  it('patches a initiative', async () => {
    params.user = await createTestUser(db)

    const testInitiative = await insertInitiative(db)
    const data = await initiativeData()

    const feature = await app
      .service('initiatives')
      .patch(testInitiative.id, data, params)

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
    expect(app.service('initiatives').update).toEqual(undefined)
  })

  it('removes a initiative', async () => {
    params.user = await createTestUser(db)

    const testInitiative = await insertInitiative(db)

    const feature = await app
      .service('initiatives')
      .remove(testInitiative.id, params)

    expect(feature.properties.name).toEqual(testInitiative.name)
    expect(feature.properties.city).toEqual(testInitiative.city)
    expect(feature.geometry.coordinates[0]).toEqual(
      Number(testInitiative.longitude)
    )
    expect(feature.geometry.coordinates[1]).toEqual(
      Number(testInitiative.latitude)
    )
    // TODO doesn't work in console??
    // expect(result.address).toEqual(testInitiative.address)
    // expect(result.description).toEqual(testInitiative.description)
    // expect(result.deliveryDays).toEqual(testInitiative.deliveryDays)

    await expect(
      app.service('initiatives').get(testInitiative.id, params)
    ).rejects.toBeInstanceOf(Error)
  })
})
