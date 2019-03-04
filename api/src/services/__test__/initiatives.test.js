import _ from 'lodash'

import app from '../../app'
import { truncateTestDatabase } from '../../../db/index'
import { initiativeData, insertInitiative } from './data/initiatives'
import { createTestUser } from './data/users'

// disable auth
jest.mock('../../hooks/authorization')
jest.mock('../../hooks/email')

describe('initiatives service', () => {
  const service = app.service('initiatives')

  const params = { provider: 'rest', headers: {}, query: {} }

  it('gets registered', () => {
    expect(service).toBeTruthy()
  })

  it('finds initiatives', async () => {
    const initiatives = await Promise.all(_.times(3, insertInitiative))

    const result = await service.find(params)
    expect(result.features).toHaveLength(3)
    initiatives.forEach(initiative => {
      const feature = result.features.find(
        f => f.properties.id === initiative.id
      )
      expect(feature.properties.name).toEqual(initiative.name)
      expect(feature.properties.city).toEqual(initiative.city)
      expect(feature.geometry.coordinates[0]).toEqual(initiative.longitude)
      expect(feature.geometry.coordinates[1]).toEqual(initiative.latitude)
    })
  })

  it('gets a initiative', async () => {
    const testInitiative = await insertInitiative()

    const feature = await service.get(testInitiative.id, params)

    expect(feature.properties.name).toEqual(testInitiative.name)
    expect(feature.properties.city).toEqual(testInitiative.city)
    expect(feature.geometry.coordinates[0]).toEqual(testInitiative.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(testInitiative.latitude)
    // TODO doesn't work in console??
    // expect(feature.properties.address).toEqual(testInitiative.address)
    // expect(feature.properties.description).toEqual(testInitiative.description)
    // expect(feature.properties.deliveryDays).toEqual(testInitiative.deliveryDays)
  })

  it('creates a initiative', async () => {
    params.user = await createTestUser(app.service('users'))

    const data = await initiativeData()

    const feature = await service.create(data, params)

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
    params.user = await createTestUser(app.service('users'))

    const testInitiative = await insertInitiative()
    const data = await initiativeData()

    const feature = await service.patch(testInitiative.id, data, params)

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
    await expect(service.update(1, {}, params)).rejects.toBeInstanceOf(Error)
  })

  it('removes a initiative', async () => {
    params.user = await createTestUser(app.service('users'))

    const testInitiative = await insertInitiative()

    const feature = await service.remove(testInitiative.id, params)

    expect(feature.properties.name).toEqual(testInitiative.name)
    expect(feature.properties.city).toEqual(testInitiative.city)
    expect(feature.geometry.coordinates[0]).toEqual(testInitiative.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(testInitiative.latitude)
    // TODO doesn't work in console??
    // expect(result.address).toEqual(testInitiative.address)
    // expect(result.description).toEqual(testInitiative.description)
    // expect(result.deliveryDays).toEqual(testInitiative.deliveryDays)

    await expect(service.get(testInitiative.id, params)).rejects.toBeInstanceOf(
      Error
    )
  })

  afterEach(async done => {
    await truncateTestDatabase()
    done()
  })
})
