import _ from 'lodash'
import { MethodNotAllowed, NotFound } from '@feathersjs/errors'

import app from '../../app'
import { truncateTestDatabase } from '../../../db/index'
import { farmData, insertFarm } from './data/farms'
import { createTestUser } from './data/users'

// disable auth
jest.mock('../../hooks/authorization')
jest.mock('../../hooks/email')

describe('farms service', () => {
  const service = app.service('farms')

  const params = { provider: 'rest', headers: {}, query: {} }

  it('gets registered', () => {
    expect(service).toBeTruthy()
  })

  it('finds farms', async () => {
    const farms = await Promise.all(_.times(3, insertFarm))

    const result = await service.find(params)
    expect(result.features).toHaveLength(3)
    farms.forEach(farm => {
      const feature = result.features.find(f => f.properties.id === farm.id)
      expect(feature.properties.name).toEqual(farm.name)
      expect(feature.properties.city).toEqual(farm.city)
      expect(feature.geometry.coordinates[0]).toEqual(farm.longitude)
      expect(feature.geometry.coordinates[1]).toEqual(farm.latitude)
    })
  })

  it('gets a farm', async () => {
    const farm = await insertFarm()

    const feature = await service.get(farm.id, params)

    expect(feature).not.toBeNull()

    expect(feature.properties.name).toEqual(farm.name)
    expect(feature.properties.city).toEqual(farm.city)
    expect(feature.geometry.coordinates[0]).toEqual(farm.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(farm.latitude)
    // TODO doesn't work in console??
    // expect(feature.properties.address).toEqual(farm.address)
    // expect(feature.properties.description).toEqual(farm.description)
    // expect(feature.properties.deliveryDays).toEqual(farm.deliveryDays)
  })

  it('creates a farm', async () => {
    params.user = await createTestUser(app.service('users'))

    const data = await farmData()

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
  it('patches a farm', async () => {
    params.user = await createTestUser(app.service('users'))

    const testfarm = await insertFarm()
    const data = await farmData()

    const feature = await service.patch(testfarm.id, data, params)

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
    await expect(service.update(1, {}, params)).rejects.toThrow(
      MethodNotAllowed
    )
  })

  it('removes a farm', async () => {
    params.user = await createTestUser(app.service('users'))

    const testfarm = await insertFarm()

    const feature = await service.remove(testfarm.id, params)
    expect(feature.properties.name).toEqual(testfarm.name)
    expect(feature.properties.city).toEqual(testfarm.city)
    expect(feature.geometry.coordinates[0]).toEqual(testfarm.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(testfarm.latitude)
    // TODO doesn't work in console??
    // expect(result.address).toEqual(testfarm.address)
    // expect(result.description).toEqual(testfarm.description)
    // expect(result.deliveryDays).toEqual(testfarm.deliveryDays)

    await expect(service.get(testfarm.id, params)).rejects.toThrow(NotFound)

  })

  afterEach(async () => truncateTestDatabase())
})
