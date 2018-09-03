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
      const feature = result.features.find(f => f.id === farm.id).toJSON()
      expect(feature.properties.name).toEqual(farm.name)
      expect(feature.properties.city).toEqual(farm.city)
      expect(feature.geometry.coordinates[0]).toEqual(farm.longitude)
      expect(feature.geometry.coordinates[1]).toEqual(farm.latitude)
    })
  })

  it('gets a farm', async () => {
    const farm = await insertFarm()

    const result = (await service.get(farm.id, params)).toJSON()

    expect(result).not.toBeNull()

    expect(result.properties.name).toEqual(farm.name)
    expect(result.properties.city).toEqual(farm.city)
    expect(result.geometry.coordinates[0]).toEqual(farm.longitude)
    expect(result.geometry.coordinates[1]).toEqual(farm.latitude)

    expect(result.properties.address).toEqual(farm.address)
    expect(result.properties.description).toEqual(farm.description)
  })

  it('creates a farm', async () => {
    params.user = await createTestUser(app.service('users'))

    const data = await farmData()

    const result = (await service.create(data, params)).toJSON()

    expect(result.properties.name).toEqual(data.name)
    expect(result.properties.city).toEqual(data.city)
    expect(result.geometry.coordinates[0]).toEqual(data.longitude)
    expect(result.geometry.coordinates[1]).toEqual(data.latitude)

    expect(result.properties.address).toEqual(data.address)
    expect(result.properties.description).toEqual(data.description)
  })
  it('patches a farm', async () => {
    params.user = await createTestUser(app.service('users'))

    const testfarm = await insertFarm()
    const patch = await farmData()

    const result = (await service.patch(testfarm.id, patch, params)).toJSON()

    expect(result.properties.name).toEqual(patch.name)
    expect(result.properties.city).toEqual(patch.city)
    expect(result.geometry.coordinates[0]).toEqual(patch.longitude)
    expect(result.geometry.coordinates[1]).toEqual(patch.latitude)

    expect(result.properties.address).toEqual(patch.address)
    expect(result.properties.description).toEqual(patch.description)
  })

  it('disallows update', async () => {
    await expect(service.update(1, {}, params)).rejects.toThrow(
      MethodNotAllowed
    )
  })

  it('removes a farm', async () => {
    params.user = await createTestUser(app.service('users'))

    const testfarm = await insertFarm()

    const result = (await service.remove(testfarm.id, params)).toJSON()
    expect(result.properties.name).toEqual(testfarm.name)
    expect(result.properties.city).toEqual(testfarm.city)
    expect(result.geometry.coordinates[0]).toEqual(testfarm.longitude)
    expect(result.geometry.coordinates[1]).toEqual(testfarm.latitude)

    expect(result.properties.address).toEqual(testfarm.address)
    expect(result.properties.description).toEqual(testfarm.description)

    await expect(service.get(testfarm.id, params)).rejects.toThrow(NotFound)
  })

  afterEach(async () => truncateTestDatabase())
})
