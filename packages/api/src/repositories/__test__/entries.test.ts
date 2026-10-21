import type { Query } from '@feathersjs/feathers'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import { createKysely, type Database } from '../../db/kysely.ts'
import { createDepotsRepository } from '../depots.ts'
import { ENTRY_COLUMNS, type AdminFilters } from '../entries.ts'
import { createFarmsRepository } from '../farms.ts'
import { createInitiativesRepository } from '../initiatives.ts'

// Seeded: farm 1 (products 1 and 3), depot 1 and initiative 1 (goals 1 and 2),
// owned by the superadmin (user 1, origin http://localhost:3000).
describe('entry repositories', () => {
  let db: Database

  beforeAll(async () => {
    await setupIntegrationTestDb()
    db = createKysely({ connection: getTestDbConnectionString })
    // admin@example.com may administer http://localhost:3000.
    await db
      .insertInto('adminsOrigins')
      .values({ userId: 2, originId: 1 })
      .execute()
    await db
      .insertInto('farmsBadges')
      .values({ farmId: 1, badgeId: 1 })
      .execute()
    await db
      .insertInto('farmsDepots')
      .values({ farmId: 1, depotId: 1 })
      .execute()
  })

  afterAll(async () => {
    await db.destroy()
    await truncateTestDb()
  })

  describe.each([
    ['farms', () => createFarmsRepository(db)],
    ['depots', () => createDepotsRepository(db)],
    ['initiatives', () => createInitiativesRepository(db)]
  ] as const)('%s', (table, repository) => {
    it('inserts, updates and deletes an entry', async () => {
      const entries = repository()

      const inserted = await entries.insert({
        name: 'Neu',
        city: 'Leipzig',
        latitude: 51.34,
        longitude: 12.37,
        active: false
      })
      expect(inserted).toMatchObject({
        name: 'Neu',
        latitude: '51.34',
        active: false
      })
      expect(
        await entries.update(inserted.id, { name: 'Geändert' })
      ).toMatchObject({ id: inserted.id, name: 'Geändert' })

      expect(await entries.findById(inserted.id, { activeOnly: true })).toBe(
        undefined
      )
      expect(
        await entries.findForAuthorization(inserted.id, { activeOnly: false })
      ).toEqual({ id: inserted.id, active: false, ownerships: [] })

      expect(await entries.delete(inserted.id)).toMatchObject({
        id: inserted.id
      })
      expect(await entries.findById(inserted.id, { activeOnly: false })).toBe(
        undefined
      )
    })

    it('reads what authorization needs', async () => {
      expect(
        await repository().findForAuthorization('1', { activeOnly: true })
      ).toEqual({ id: '1', active: true, ownerships: [{ id: '1' }] })
    })

    it("checks the entry's origins against the admin's", async () => {
      const entries = repository()

      expect(await entries.isInAdminOrigins('1', '2')).toBe(true)
      expect(await entries.isInAdminOrigins('1', '3')).toBe(false)
    })

    it('finds the active entries and accepts no filter', async () => {
      const entries = repository()

      expect(await entries.findActive({}, ['id', 'name'])).toEqual([
        expect.objectContaining({ id: '1' })
      ])
      await expect(entries.findActive({ name: 'x' }, ['id'])).rejects.toThrow(
        'Invalid query parameter name'
      )
      await expect(
        entries.findActive({ $eager: '[ownerships]' }, ['id'])
      ).rejects.toThrow('Invalid query parameter $eager')
    })

    it('finds a page by name and within origins', async () => {
      const entries = repository()
      const ids = async (query: Query, filters: AdminFilters) =>
        (await entries.findPage(query, filters)).data.map(({ id }) => id)

      expect(await ids({ name: 'BEISPIEL' }, {})).toEqual(['1'])
      expect(await ids({ q: 'nothing' }, {})).toEqual([])
      expect(await ids({}, { inOrigins: ['http://localhost:3000'] })).toEqual([
        '1'
      ])
      expect(await ids({}, { inOrigins: ['http://localhost:4000'] })).toEqual(
        []
      )
      expect(await ids({}, { inOrigins: [] })).toEqual([])
      await expect(entries.findPage({ password: 'x' }, {})).rejects.toThrow(
        'Invalid query parameter password'
      )
    })

    it(`loads the owners of several ${table} at once`, async () => {
      expect(
        await repository().findOwners(['1', '999'], ['id', 'email'])
      ).toEqual([{ entryId: '1', id: '1', email: 'superadmin@example.com' }])
      expect(await repository().findOwners([], ['id'])).toEqual([])
    })
  })

  describe('farms', () => {
    it('filters a page by badge', async () => {
      const farms = createFarmsRepository(db)
      const ids = async (filters: AdminFilters) =>
        (await farms.findPage({}, filters)).data.map(({ id }) => id)

      expect(await ids({ withBadge: '1' })).toEqual(['1'])
      expect(await ids({ withBadge: '2' })).toEqual([])
      expect(await ids({ withoutBadge: '2' })).toEqual(['1'])
    })

    it('loads relations in join order', async () => {
      const farms = createFarmsRepository(db)

      expect(await farms.findProducts(['1'])).toEqual([
        {
          entryId: '1',
          id: '1',
          category: 'vegetable_products',
          name: 'vegetables'
        },
        {
          entryId: '1',
          id: '3',
          category: 'vegetable_products',
          name: 'mushrooms'
        }
      ])
      expect(await farms.findDepots(['1'], ENTRY_COLUMNS)).toEqual([
        expect.objectContaining({ entryId: '1', id: '1', street: null })
      ])
      expect(await farms.findBadges(['1'], ['id', 'country'])).toEqual([
        { entryId: '1', id: '1', country: 'DEU' }
      ])
    })
  })

  it('loads the farms of depots and the goals of initiatives', async () => {
    expect(
      await createDepotsRepository(db).findFarms(['1'], ['id', 'name'])
    ).toEqual([{ entryId: '1', id: '1', name: 'Beispiel-Farm 1' }])
    expect(await createInitiativesRepository(db).findGoals(['1'])).toEqual([
      { entryId: '1', id: '1', name: 'land' },
      { entryId: '1', id: '2', name: 'staff' }
    ])
  })
})
