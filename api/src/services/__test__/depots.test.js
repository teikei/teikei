import _ from 'lodash'

import app from '../../app'
import { truncateTestDatabase } from '../../../db/index'
import { depotData, insertDepot } from './data/depots'
import { createTestUser } from './data/users'

// disable auth
jest.mock('../../hooks/authorization')
jest.mock('../../hooks/email')

describe('depots service', () => {
  const service = app.service('depots')

  const params = { provider: 'rest', headers: {}, query: {} }

  it('gets registered', () => {
    expect(service).toBeTruthy()
  })

  it('finds depots', async () => {
    const depots = await Promise.all(_.times(3, insertDepot))

    const result = await service.find(params)

    expect(result.features).toHaveLength(3)
    depots.forEach(depot => {
      const feature = result.features.find(f => f.properties.id === depot.id)
      expect(feature.properties.name).toEqual(depot.name)
      expect(feature.properties.city).toEqual(depot.city)
      expect(feature.geometry.coordinates[0]).toEqual(depot.longitude)
      expect(feature.geometry.coordinates[1]).toEqual(depot.latitude)
    })
  })

  it('gets a depot', async () => {
    const depot = await insertDepot()

    const feature = await service.get(depot.id, params)

    expect(feature.properties.name).toEqual(depot.name)
    expect(feature.properties.city).toEqual(depot.city)
    expect(feature.geometry.coordinates[0]).toEqual(depot.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(depot.latitude)
    // TODO doesn't work in console??
    // expect(feature.properties.address).toEqual(depot.address)
    // expect(feature.properties.description).toEqual(depot.description)
    // expect(feature.properties.deliveryDays).toEqual(depot.deliveryDays)
  })

  it('creates a depot', async () => {
    params.user = await createTestUser(app.service('users'))

    const data = await depotData()

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
  it('patches a depot', async () => {
    params.user = await createTestUser(app.service('users'))

    const testDepot = await insertDepot()
    const data = await depotData()

    const feature = await service.patch(testDepot.id, data, params)

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

  it('removes a depot', async () => {
    params.user = await createTestUser(app.service('users'))

    const testDepot = await insertDepot()

    const feature = await service.remove(testDepot.id, params)
    expect(feature.properties.name).toEqual(testDepot.name)
    expect(feature.properties.city).toEqual(testDepot.city)
    expect(feature.geometry.coordinates[0]).toEqual(testDepot.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(testDepot.latitude)
    // TODO doesn't work in console??
    // expect(result.address).toEqual(testDepot.address)
    // expect(result.description).toEqual(testDepot.description)
    // expect(result.deliveryDays).toEqual(testDepot.deliveryDays)

    await expect(service.get(testDepot.id, params)).rejects.toBeInstanceOf(
      Error
    )
  })

  afterEach(async done => {
    await truncateTestDatabase()
    done()
  })
})
