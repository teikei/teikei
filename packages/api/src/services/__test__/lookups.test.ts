import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.js'
import { badges, goals, products } from './data/lookups.ts'

// Characterises the public lookup endpoints the embed map reads, so the move
// away from feathers-objection keeps them identical.
describe.each([
  ['products', products],
  ['goals', goals],
  ['badges', badges]
])('public %s service', (path, records) => {
  let server: Server
  let baseUrl: string

  const request = (url: string, method = 'GET') =>
    fetch(`${baseUrl}/${url}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: method === 'GET' || method === 'DELETE' ? undefined : '{}'
    })

  beforeAll(async () => {
    await setupIntegrationTestDb()
    const app = appLauncher.startApp({
      postgres: { client: 'pg', connection: getTestDbConnectionString }
    })
    server = await app.listen(0)
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
    await truncateTestDb()
  })

  it('finds every record, unpaginated', async () => {
    const response = await request(path)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(records)
  })

  it('filters, sorts and limits with Feathers query parameters', async () => {
    const byIds = await request(`${path}?id[$in][0]=2&id[$in][1]=1&$sort[id]=1`)
    expect(await byIds.json()).toEqual(records.slice(0, 2))

    const last = await request(`${path}?$sort[id]=-1&$limit=1`)
    expect(await last.json()).toEqual(records.slice(-1))
  })

  it('gets a record', async () => {
    const response = await request(`${path}/2`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(records[1])
  })

  it('answers 404 for a missing id', async () => {
    const response = await request(`${path}/999999`)

    expect(response.status).toBe(404)
  })

  it('answers 400 for a malformed id', async () => {
    const response = await request(`${path}/abc`)

    expect(response.status).toBe(400)
  })

  it.each([
    ['create', 'POST', ''],
    ['update', 'PUT', '/1'],
    ['patch', 'PATCH', '/1'],
    ['remove', 'DELETE', '/1']
  ])('does not offer %s', async (_, method, id) => {
    const response = await request(`${path}${id}`, method)

    // The services were read-only behind the authorization hook (403) and now
    // lack the methods, which the REST transport answers before any hook.
    expect(response.status).toBe(405)
  })
})
