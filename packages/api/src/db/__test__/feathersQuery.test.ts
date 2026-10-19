import { BadRequest } from '@feathersjs/errors'
import type { Query } from '@feathersjs/feathers'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import { findMatching, findPage } from '../feathersQuery.ts'
import { createKysely, type Database } from '../kysely.ts'

// The seeds insert 16 products with ids 1 to 16: 6 vegetable_products,
// 7 animal_products and 3 beverages.
describe('findPage', () => {
  let db: Database

  const findProducts = (query: Query) =>
    findPage(db.selectFrom('products').selectAll(), query, [
      'id',
      'category',
      'name'
    ])

  const ids = (page: { data: { id: string }[] }) => page.data.map((p) => p.id)

  beforeAll(async () => {
    await setupIntegrationTestDb()
    db = createKysely({ connection: getTestDbConnectionString })
  })

  afterAll(async () => {
    await db.destroy()
    await truncateTestDb()
  })

  it('returns the first 50 rows with the total when no query is given', async () => {
    const page = await findProducts({})

    expect(page).toMatchObject({ total: 16, limit: 50, skip: 0 })
    expect(page.data).toHaveLength(16)
    expect(page.data[0]).toEqual({
      id: expect.any(String),
      category: expect.any(String),
      name: expect.any(String)
    })
  })

  it('pages with $limit and $skip given as query strings', async () => {
    const page = await findProducts({
      $limit: '5',
      $skip: '5',
      $sort: { id: '1' }
    })

    expect(page).toMatchObject({ total: 16, limit: 5, skip: 5 })
    expect(ids(page)).toEqual(['6', '7', '8', '9', '10'])
  })

  it('sorts descending with $sort -1', async () => {
    const page = await findProducts({ $sort: { id: '-1' }, $limit: '2' })

    expect(ids(page)).toEqual(['16', '15'])
  })

  it('counts every match, not just the returned page', async () => {
    const page = await findProducts({ category: 'animal_products', $limit: 2 })

    expect(page.total).toBe(7)
    expect(page.data).toHaveLength(2)
  })

  it('filters by equality', async () => {
    const page = await findProducts({ category: 'beverages' })

    expect(page.data.map((p) => p.name).sort()).toEqual([
      'beer',
      'juice',
      'wine'
    ])
  })

  it('filters with $in, as getMany sends it', async () => {
    const page = await findProducts({
      id: { $in: ['3', '1'] },
      $limit: '2',
      $sort: { id: 1 }
    })

    expect(ids(page)).toEqual(['1', '3'])
  })

  it('matches nothing for an empty $in', async () => {
    const page = await findProducts({ id: { $in: [] } })

    expect(page).toMatchObject({ total: 0, data: [] })
  })

  it('filters with $ne', async () => {
    const page = await findProducts({ category: { $ne: 'beverages' } })

    expect(page.total).toBe(13)
  })

  it('filters with $ilike', async () => {
    const page = await findProducts({ name: { $ilike: '%EE%' } })

    expect(page.data.map((p) => p.name)).toEqual(['beer'])
  })

  it.each([
    ['an unknown column', { password: 'x' }],
    ['$sort on an unknown column', { $sort: { password: 1 } }],
    ['$select', { $select: ['name'] }],
    ['$eager', { $eager: '[farms]' }],
    ['$modify', { $modify: 'hasBadge' }],
    ['$joinRelation', { $joinRelation: 'farms' }],
    ['$or', { $or: [{ name: 'beer' }, { name: 'wine' }] }],
    ['an unsupported operator', { id: { $gt: 3 } }]
  ])('rejects %s with BadRequest', async (_, query) => {
    await expect(findProducts(query)).rejects.toThrow(BadRequest)
  })
})

describe('findMatching', () => {
  let db: Database

  const findProducts = (query: Query) =>
    findMatching(db.selectFrom('products').selectAll(), query, [
      'id',
      'category',
      'name'
    ])

  beforeAll(async () => {
    await setupIntegrationTestDb()
    db = createKysely({ connection: getTestDbConnectionString })
  })

  afterAll(async () => {
    await db.destroy()
    await truncateTestDb()
  })

  it('returns every row as an array when no query is given', async () => {
    expect(await findProducts({})).toHaveLength(16)
  })

  it('filters and sorts like findPage', async () => {
    const rows = await findProducts({
      category: 'beverages',
      $sort: { name: '1' }
    })

    expect(rows.map((p) => p.name)).toEqual(['beer', 'juice', 'wine'])
  })

  it('limits and skips only when asked to', async () => {
    const rows = await findProducts({
      $sort: { id: 1 },
      $limit: '2',
      $skip: '1'
    })

    expect(rows.map((p) => p.id)).toEqual(['2', '3'])
  })

  it('rejects what findPage rejects', async () => {
    await expect(findProducts({ $select: ['name'] })).rejects.toThrow(
      BadRequest
    )
  })
})
