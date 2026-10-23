import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.js'
import { badges, goals, origins, products, roles } from './data/lookups.ts'

// Characterises the admin lookup endpoints as ra-data-feathers calls them
// (query strings from src/db/feathersQuery.ts), signed in as superadmin.
describe('admin lookup services', () => {
  let server: Server
  let baseUrl: string
  let accessToken: string

  const api = async (method: string, url: string, body?: object) => {
    const response = await fetch(`${baseUrl}/${url}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(accessToken && { authorization: accessToken })
      },
      body: body && JSON.stringify(body)
    })
    return { status: response.status, body: await response.json() }
  }

  beforeAll(async () => {
    await setupIntegrationTestDb()
    const app = appLauncher.startApp({
      postgres: { client: 'pg', connection: getTestDbConnectionString }
    })
    server = await app.listen(0)
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    accessToken = (
      await api('POST', 'authentication', {
        strategy: 'local',
        email: 'superadmin@example.com',
        password: 'admin'
      })
    ).body.accessToken
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
    await truncateTestDb()
  })

  describe.each([
    ['admin/products', products],
    ['admin/goals', goals],
    ['admin/badges', badges],
    ['admin/roles', roles],
    ['admin/origins', origins]
  ])('%s', (path, records) => {
    it('finds the first page with the default limit', async () => {
      expect(await api('GET', path)).toEqual({
        status: 200,
        body: { total: records.length, limit: 50, skip: 0, data: records }
      })
    })

    it('pages and sorts like a react-admin list', async () => {
      expect(await api('GET', `${path}?$limit=1&$skip=1&$sort[id]=-1`)).toEqual(
        {
          status: 200,
          body: {
            total: records.length,
            limit: 1,
            skip: 1,
            data: [records[records.length - 2]]
          }
        }
      )
    })

    it('finds by ids like getMany', async () => {
      expect(
        await api('GET', `${path}?id[$in][0]=2&id[$in][1]=1&$limit=2`)
      ).toEqual({
        status: 200,
        body: { total: 2, limit: 2, skip: 0, data: records.slice(0, 2) }
      })
    })

    it('gets a record', async () => {
      expect(await api('GET', `${path}/2`)).toEqual({
        status: 200,
        body: records[1]
      })
    })

    it('answers 404 for a missing id', async () => {
      expect((await api('GET', `${path}/999999`)).status).toBe(404)
    })
  })

  it('filters with $ilike', async () => {
    expect(
      await api('GET', 'admin/products?name[$ilike]=%25EE%25&$sort[id]=1')
    ).toEqual({
      status: 200,
      body: { total: 1, limit: 50, skip: 0, data: [products[15]] }
    })
  })

  it('filters origins with $ne like the user form', async () => {
    expect(
      await api('GET', 'admin/origins?origin[$ne]=http://localhost:3000')
    ).toEqual({
      status: 200,
      body: { total: 1, limit: 50, skip: 0, data: [origins[1]] }
    })
  })

  it.each(['$eager=[farms]', '$select[]=name'])(
    'rejects %s, which ra-data-feathers never sends',
    async (query) => {
      expect((await api('GET', `admin/products?${query}`)).status).toBe(400)
    }
  )

  describe('admin/products writes', () => {
    it('creates and patches a product', async () => {
      const created = await api('POST', 'admin/products', {
        category: 'beverages',
        name: 'cider'
      })
      expect(created).toEqual({
        status: 201,
        body: {
          id: '17',
          category: 'beverages',
          name: 'cider',
          type: 'Product',
          link: '/products/17'
        }
      })

      expect(
        await api('PATCH', 'admin/products/17', { name: 'perry' })
      ).toEqual({
        status: 200,
        body: { ...created.body, name: 'perry' }
      })
    })

    it('answers 409 for a duplicate product', async () => {
      const duplicate = await api('POST', 'admin/products', {
        category: 'beverages',
        name: 'beer'
      })

      expect(duplicate.status).toBe(409)
    })

    it('answers 404 when patching a missing product', async () => {
      const patched = await api('PATCH', 'admin/products/999999', {
        name: 'nothing'
      })

      expect(patched.status).toBe(404)
    })
  })

  describe('admin/goals writes', () => {
    it('creates and patches a goal', async () => {
      const created = await api('POST', 'admin/goals', { name: 'climate' })
      expect(created).toEqual({
        status: 201,
        body: { id: '5', name: 'climate', type: 'Goal', link: '/goals/5' }
      })

      expect(await api('PATCH', 'admin/goals/5', { name: 'soil' })).toEqual({
        status: 200,
        body: { ...created.body, name: 'soil' }
      })
    })

    it('answers an empty patch with the unchanged goal', async () => {
      expect(await api('PATCH', 'admin/goals/1', {})).toEqual({
        status: 200,
        body: goals[0]
      })
    })

    it('answers 409 for a duplicate goal', async () => {
      const duplicate = await api('POST', 'admin/goals', { name: 'land' })

      expect(duplicate.status).toBe(409)
    })

    it('answers 404 when patching a missing goal', async () => {
      const patched = await api('PATCH', 'admin/goals/999999', {
        name: 'nothing'
      })

      expect(patched.status).toBe(404)
    })
  })

  describe('admin/badges writes', () => {
    const badge = {
      name: 'Demeter',
      category: 'certifications',
      country: 'DEU',
      url: 'https://www.demeter.de',
      logo: '/demeter.png'
    }

    it('creates, patches and removes a badge', async () => {
      const created = await api('POST', 'admin/badges', badge)
      expect(created).toEqual({
        status: 201,
        body: { id: '3', ...badge, type: 'Badge', link: '/badges/3' }
      })

      // with the fields of the record it read, as a client sends it back
      const patched = await api('PATCH', 'admin/badges/3', {
        ...created.body,
        country: 'AUT'
      })
      expect(patched).toEqual({
        status: 200,
        body: { ...created.body, country: 'AUT' }
      })

      expect(await api('DELETE', 'admin/badges/3')).toEqual({
        status: 200,
        body: patched.body
      })
      expect((await api('GET', 'admin/badges/3')).status).toBe(404)
    })

    it('answers 404 when patching or removing a missing badge', async () => {
      expect(
        (await api('PATCH', 'admin/badges/999999', { name: 'nothing' })).status
      ).toBe(404)
      expect((await api('DELETE', 'admin/badges/999999')).status).toBe(404)
    })
  })
})
