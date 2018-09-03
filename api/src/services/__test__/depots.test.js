import _ from 'lodash'
import { MethodNotAllowed, NotFound } from '@feathersjs/errors'

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
      const feature = result.features.find(f => f.id === depot.id).toJSON()
      expect(feature.properties.name).toEqual(depot.name)
      expect(feature.properties.city).toEqual(depot.city)
      expect(feature.geometry.coordinates[0]).toEqual(depot.longitude)
      expect(feature.geometry.coordinates[1]).toEqual(depot.latitude)
    })
  })

  it('gets a depot', async () => {
    const depot = await insertDepot()

    const result = await service.get(depot.id, params)

    expect(result).not.toBeNull()

    const feature = result.toJSON()

    expect(feature.properties.name).toEqual(depot.name)
    expect(feature.properties.city).toEqual(depot.city)
    expect(feature.geometry.coordinates[0]).toEqual(depot.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(depot.latitude)

    expect(feature.properties.address).toEqual(depot.address)
    expect(feature.properties.description).toEqual(depot.description)
    expect(feature.properties.deliveryDays).toEqual(depot.deliveryDays)
  })

  it('creates a depot', async () => {
    params.user = await createTestUser(app.service('users'))

    const data = await depotData()

    const result = (await service.create(data, params)).toJSON()

    expect(result.properties.name).toEqual(data.name)
    expect(result.properties.city).toEqual(data.city)
    expect(result.geometry.coordinates[0]).toEqual(data.longitude)
    expect(result.geometry.coordinates[1]).toEqual(data.latitude)

    expect(result.properties.address).toEqual(data.address)
    expect(result.properties.description).toEqual(data.description)
    expect(result.properties.deliveryDays).toEqual(data.deliveryDays)
  })
  it('patches a depot', async () => {
    params.user = await createTestUser(app.service('users'))

    const testDepot = await insertDepot()
    const patch = await depotData()

    const result = (await service.patch(testDepot.id, patch, params)).toJSON()

    expect(result.properties.name).toEqual(patch.name)
    expect(result.properties.city).toEqual(patch.city)
    expect(result.geometry.coordinates[0]).toEqual(patch.longitude)
    expect(result.geometry.coordinates[1]).toEqual(patch.latitude)

    expect(result.properties.address).toEqual(patch.address)
    expect(result.properties.description).toEqual(patch.description)
    expect(result.properties.deliveryDays).toEqual(patch.deliveryDays)
  })

  it('disallows update', async () => {
    await expect(service.update(1, {}, params)).rejects.toThrow(
      MethodNotAllowed
    )
  })

  it('removes a depot', async () => {
    params.user = await createTestUser(app.service('users'))

    const testDepot = await insertDepot()

    const result = (await service.remove(testDepot.id, params)).toJSON()
    expect(result.properties.name).toEqual(testDepot.name)
    expect(result.properties.city).toEqual(testDepot.city)
    expect(result.geometry.coordinates[0]).toEqual(testDepot.longitude)
    expect(result.geometry.coordinates[1]).toEqual(testDepot.latitude)

    expect(result.properties.address).toEqual(testDepot.address)
    expect(result.properties.description).toEqual(testDepot.description)
    expect(result.properties.deliveryDays).toEqual(testDepot.deliveryDays)

    await expect(service.get(testDepot.id, params)).rejects.toThrow(NotFound)
  })

  afterEach(async () => truncateTestDatabase())
})
