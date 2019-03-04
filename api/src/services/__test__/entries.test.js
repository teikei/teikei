import _ from 'lodash'

import app from '../../app'
import { truncateTestDatabase } from '../../../db/index'
import { insertFarm } from './data/farms'
import { insertDepot } from './data/depots'
import { insertInitiative } from './data/initiatives'

// disable auth
jest.mock('../../hooks/authorization')
jest.mock('../../hooks/email')

describe('entries service', () => {
  const service = app.service('entries')

  const params = { provider: 'rest', headers: {}, query: {} }

  it('gets registered', () => {
    expect(service).toBeTruthy()
  })

  it('finds entries', async () => {
    const farms = await Promise.all(_.times(3, insertFarm))
    const depots = await Promise.all(_.times(3, insertDepot))
    const initiatives = await Promise.all(_.times(3, insertInitiative))

    const result = await service.find(params)
    expect(result.features).toHaveLength(9)
    const entries = [farms, depots, initiatives]
    entries.forEach(type =>
      type.forEach(entry => {
        const feature = result.features.find(
          f =>
            f.properties.id === entry.id && entry.type() === f.properties.type
        )
        expect(feature.properties.name).toEqual(entry.name)
        expect(feature.properties.city).toEqual(entry.city)
        expect(feature.geometry.coordinates[0]).toEqual(entry.longitude)
        expect(feature.geometry.coordinates[1]).toEqual(entry.latitude)
      })
    )
  })

  it('has no get method', () => {
    expect(service.get).toEqual(undefined)
  })

  it('has no create method', () => {
    // TODO why null instead of undefined?
    expect(service.create).toEqual(null)
  })

  it('has no patch method', () => {
    expect(service.patch).toEqual(undefined)
  })

  it('has no update method', () => {
    expect(service.update).toEqual(undefined)
  })

  it('has no remove method', () => {
    expect(service.remove).toEqual(undefined)
  })

  it('fails', () => {
    expect(false).toBe(true)
  })

  afterEach(async done => {
    await truncateTestDatabase()
    done()
  })
})
