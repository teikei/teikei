import _ from 'lodash'

import appLauncher from '../../app'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup'
import { insertFarm } from './data/farms'
import { insertDepot } from './data/depots'
import { insertInitiative } from './data/initiatives'

// disable auth
jest.mock('../../hooks/authorization')
jest.mock('../../hooks/email')

describe('entries service', () => {
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
    expect(app.service('entries')).toBeTruthy()
  })

  it('finds entries', async () => {
    const farms = await Promise.all(_.times(3, insertFarm))
    const depots = await Promise.all(_.times(3, insertDepot))
    const initiatives = await Promise.all(_.times(3, insertInitiative))

    const result = await app.service('entries').find(params)
    expect(result.features).toHaveLength(9)
    const entries = [farms, depots, initiatives]
    entries.forEach((type) =>
      type.forEach((entry) => {
        const feature = result.features.find(
          (f) =>
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
    expect(app.service('entries').get).toEqual(undefined)
  })

  it('has no create method', () => {
    expect(app.service('entries').create).toEqual(undefined)
  })

  it('has no patch method', () => {
    expect(app.service('entries').patch).toEqual(undefined)
  })

  it('has no update method', () => {
    expect(app.service('entries').update).toEqual(undefined)
  })

  it('has no remove method', () => {
    expect(app.service('entries').remove).toEqual(undefined)
  })
})
