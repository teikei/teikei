import _ from 'lodash'
import { MethodNotAllowed, NotFound } from '@feathersjs/errors'

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
      const feature = result.features.find(f => f.id === initiative.id).toJSON()

      expect(feature.properties.name).toEqual(initiative.name)
      expect(feature.properties.city).toEqual(initiative.city)
      expect(feature.geometry.coordinates[0]).toEqual(initiative.longitude)
      expect(feature.geometry.coordinates[1]).toEqual(initiative.latitude)
    })
  })

  it('gets a initiative', async () => {
    const initiative = await insertInitiative()

    const feature = (await service.get(initiative.id, params)).toJSON()

    expect(feature).not.toBeNull()

    expect(feature.properties.name).toEqual(initiative.name)
    expect(feature.properties.city).toEqual(initiative.city)
    expect(feature.geometry.coordinates[0]).toEqual(initiative.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(initiative.latitude)

    expect(feature.properties.address).toEqual(initiative.address)
    expect(feature.properties.description).toEqual(initiative.description)
  })

  it('creates a initiative', async () => {
    params.user = await createTestUser(app.service('users'))

    const data = await initiativeData()

    const feature = (await service.create(data, params)).toJSON()

    expect(feature.properties.name).toEqual(data.name)
    expect(feature.properties.city).toEqual(data.city)
    expect(feature.geometry.coordinates[0]).toEqual(data.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(data.latitude)

    expect(feature.properties.address).toEqual(data.address)
    expect(feature.properties.description).toEqual(data.description)

  })
  it('patches a initiative', async () => {
    params.user = await createTestUser(app.service('users'))

    const testinitiative = await insertInitiative()
    const patch = await initiativeData()

    const feature = (await service.patch(testinitiative.id, patch, params)).toJSON()

    expect(feature.properties.name).toEqual(patch.name)
    expect(feature.properties.city).toEqual(patch.city)
    expect(feature.geometry.coordinates[0]).toEqual(patch.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(patch.latitude)

    expect(feature.properties.address).toEqual(patch.address)
    expect(feature.properties.description).toEqual(patch.description)

  })

  it('disallows update', async () => {
    await expect(service.update(1, {}, params)).rejects.toThrow(
      MethodNotAllowed
    )
  })

  it('removes a initiative', async () => {
    params.user = await createTestUser(app.service('users'))

    const testInitiative = await insertInitiative()

    const feature = (await service.remove(testInitiative.id, params)).toJSON()
    expect(feature.properties.name).toEqual(testInitiative.name)
    expect(feature.properties.city).toEqual(testInitiative.city)
    expect(feature.geometry.coordinates[0]).toEqual(testInitiative.longitude)
    expect(feature.geometry.coordinates[1]).toEqual(testInitiative.latitude)

    expect(feature.properties.address).toEqual(testInitiative.address)
    expect(feature.properties.description).toEqual(testInitiative.description)

    await expect(service.get(testInitiative.id, params)).rejects.toThrow(NotFound)

  })

  afterEach(async () => truncateTestDatabase())
})
