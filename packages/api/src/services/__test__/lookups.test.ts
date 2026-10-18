import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.js'

// Characterises the public lookup endpoints the embed map reads, as seeded by
// db/seeds, so the move away from feathers-objection keeps them identical.

const products = [
  ['vegetable_products', 'vegetables'],
  ['vegetable_products', 'fruits'],
  ['vegetable_products', 'mushrooms'],
  ['vegetable_products', 'cereals'],
  ['vegetable_products', 'bread_and_pastries'],
  ['vegetable_products', 'spices'],
  ['animal_products', 'eggs'],
  ['animal_products', 'meat'],
  ['animal_products', 'sausages'],
  ['animal_products', 'milk'],
  ['animal_products', 'dairy'],
  ['animal_products', 'fish'],
  ['animal_products', 'honey'],
  ['beverages', 'juice'],
  ['beverages', 'wine'],
  ['beverages', 'beer']
].map(([category, name], index) => ({
  id: `${index + 1}`,
  category,
  name,
  type: 'Product',
  link: `/products/${index + 1}`
}))

const goals = ['land', 'staff', 'organizers', 'consumers'].map(
  (name, index) => ({
    id: `${index + 1}`,
    name,
    type: 'Goal',
    link: `/goals/${index + 1}`
  })
)

const badges = [
  {
    id: '1',
    name: 'Agriculture Association',
    category: 'associations',
    country: 'DEU',
    url: 'http://www.agriculture.com',
    logo: '/agriculture.png',
    type: 'Badge',
    link: '/badges/1'
  },
  {
    id: '2',
    name: 'Organic Foo Certification',
    category: 'certifications',
    country: 'DEU',
    url: 'http://www.organic.com',
    logo: '/organic.png',
    type: 'Badge',
    link: '/badges/2'
  }
]

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
