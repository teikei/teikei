import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import { createKysely, type Database } from '../../db/kysely.ts'
import { createBadgesRepository } from '../badges.ts'
import { createGoalsRepository } from '../goals.ts'
import { createProductsRepository } from '../products.ts'

describe('lookup repositories', () => {
  let db: Database

  beforeAll(async () => {
    await setupIntegrationTestDb()
    db = createKysely({ connection: getTestDbConnectionString })
  })

  afterAll(async () => {
    await db.destroy()
    await truncateTestDb()
  })

  it('reads products', async () => {
    const products = createProductsRepository(db)

    expect(await products.findAll({})).toHaveLength(16)
    expect(await products.findById('16')).toEqual({
      id: '16',
      category: 'beverages',
      name: 'beer'
    })
  })

  it('reads goals', async () => {
    const goals = createGoalsRepository(db)

    expect(await goals.findAll({})).toHaveLength(4)
    expect(await goals.findById('1')).toEqual({ id: '1', name: 'land' })
  })

  it('reads badges', async () => {
    const badges = createBadgesRepository(db)

    expect(await badges.findAll({})).toHaveLength(2)
    expect(await badges.findById('2')).toEqual({
      id: '2',
      name: 'Organic Foo Certification',
      category: 'certifications',
      country: 'DEU',
      url: 'http://www.organic.com',
      logo: '/organic.png'
    })
  })

  it('returns undefined for a missing id', async () => {
    expect(await createGoalsRepository(db).findById('999999')).toBeUndefined()
  })

  it('finds a page restricted to the queryable columns', async () => {
    const products = createProductsRepository(db)

    const page = await products.find({
      category: 'beverages',
      $sort: { id: -1 },
      $limit: 1
    })

    expect(page).toEqual({
      total: 3,
      limit: 1,
      skip: 0,
      data: [{ id: '16', category: 'beverages', name: 'beer' }]
    })
    await expect(products.find({ password: 'x' })).rejects.toThrow(
      'Invalid query parameter password'
    )
  })

  it('inserts and updates goals', async () => {
    const goals = createGoalsRepository(db)

    const inserted = await goals.insert({ name: 'water' })
    expect(inserted).toEqual({ id: expect.any(String), name: 'water' })

    expect(await goals.update(inserted.id, { name: 'rivers' })).toEqual({
      id: inserted.id,
      name: 'rivers'
    })
    expect(await goals.update('999999', { name: 'nothing' })).toBeUndefined()
  })

  it('deletes badges', async () => {
    const badges = createBadgesRepository(db)
    const inserted = await badges.insert({ name: 'Bioland' })

    expect(await badges.delete(inserted.id)).toEqual(inserted)
    expect(await badges.findById(inserted.id)).toBeUndefined()
    expect(await badges.delete(inserted.id)).toBeUndefined()
  })

  it('reads inside a transaction it is given', async () => {
    const goals = createGoalsRepository(db)

    const [inside, outside] = await db.transaction().execute(async (trx) => {
      await trx.insertInto('goals').values({ name: 'not committed' }).execute()
      return Promise.all([goals.findAll({}, trx), goals.findAll({})])
    })

    expect(inside.map((goal) => goal.name)).toContain('not committed')
    expect(outside.map((goal) => goal.name)).not.toContain('not committed')
  })
})
