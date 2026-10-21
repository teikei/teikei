import type { Query } from '@feathersjs/feathers'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import { createKysely, type Database } from '../../db/kysely.ts'
import { createDepotsRepository } from '../depots.ts'
import type { AdminFilters } from '../entries.ts'
import { createFarmsRepository } from '../farms.ts'
import { createInitiativesRepository } from '../initiatives.ts'
import { transaction } from '../transaction.ts'

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
  ] as const)('%s', (_table, repository) => {
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

      expect(await entries.findDetailsById(inserted.id)).toBe(undefined)
      expect(
        await entries.findForAuthorization(inserted.id, { activeOnly: false })
      ).toEqual({ id: inserted.id, active: false, ownerships: [] })

      expect(await entries.delete(inserted.id)).toMatchObject({
        id: inserted.id
      })
      expect(await entries.findAdminById(inserted.id, { details: false })).toBe(
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

      expect(await entries.findSummaries({})).toEqual([
        expect.objectContaining({ id: '1' })
      ])
      await expect(entries.findSummaries({ name: 'x' })).rejects.toThrow(
        'Invalid query parameter name'
      )
      await expect(
        entries.findSummaries({ $eager: '[ownerships]' })
      ).rejects.toThrow('Invalid query parameter $eager')
    })

    it('finds a page by name and within origins', async () => {
      const entries = repository()
      const ids = async (query: Query, filters: AdminFilters) =>
        (
          await entries.findAdminPage(query, filters, { details: false })
        ).data.map(({ id }) => id)

      expect(await ids({ name: 'BEISPIEL' }, {})).toEqual(['1'])
      expect(await ids({ q: 'nothing' }, {})).toEqual([])
      expect(await ids({}, { inOrigins: ['http://localhost:3000'] })).toEqual([
        '1'
      ])
      expect(await ids({}, { inOrigins: ['http://localhost:4000'] })).toEqual(
        []
      )
      expect(await ids({}, { inOrigins: [] })).toEqual([])
      await expect(
        entries.findAdminPage({ password: 'x' }, {}, { details: false })
      ).rejects.toThrow('Invalid query parameter password')
    })

    it('loads the owners as ids or as records without secrets', async () => {
      const entries = repository()

      expect(
        (await entries.findAdminById('1', { details: false }))?.ownerships
      ).toEqual(['1'])
      const [owner] =
        (await entries.findAdminById('1', { details: true }))?.ownerships ?? []
      expect(owner).toMatchObject({ id: '1', email: 'superadmin@example.com' })
      expect(owner).not.toHaveProperty('password')
    })

    it('replaces the owners in a transaction', async () => {
      const entries = repository()
      const owners = async () =>
        (await entries.findForAuthorization('1', { activeOnly: false }))
          ?.ownerships

      await transaction(db, (tx) =>
        entries.saveRelations('1', { ownerships: ['3', 2] }, tx)
      )
      expect(await owners()).toEqual([{ id: '2' }, { id: '3' }])

      await transaction(db, (tx) =>
        entries.saveRelations('1', { ownerships: ['1'] }, tx)
      )
      expect(await owners()).toEqual([{ id: '1' }])
    })
  })

  describe('farms', () => {
    it('filters a page by badge', async () => {
      const farms = createFarmsRepository(db)
      const ids = async (filters: AdminFilters) =>
        (await farms.findAdminPage({}, filters, { details: false })).data.map(
          ({ id }) => id
        )

      expect(await ids({ withBadge: '1' })).toEqual(['1'])
      expect(await ids({ withBadge: '2' })).toEqual([])
      expect(await ids({ withoutBadge: '2' })).toEqual(['1'])
    })

    it('assembles the detail shape, relations ordered by related id', async () => {
      const farm = await createFarmsRepository(db).findDetailsById('1')

      expect(farm?.products).toEqual([
        { id: '1', category: 'vegetable_products', name: 'vegetables' },
        { id: '3', category: 'vegetable_products', name: 'mushrooms' }
      ])
      expect(farm?.depots).toEqual([
        expect.objectContaining({ id: '1', street: null })
      ])
      expect(farm?.badges).toEqual([
        expect.objectContaining({ id: '1', name: expect.any(String) })
      ])
      expect(farm?.badges[0]).not.toHaveProperty('country')
    })

    it('saves only the relations it is given', async () => {
      const farms = createFarmsRepository(db)
      const relations = async () => {
        const farm = await farms.findAdminById('1', { details: false })
        return { products: farm?.products, badges: farm?.badges }
      }

      await transaction(db, (tx) =>
        farms.saveRelations('1', { products: [3, '2'] }, tx)
      )
      expect(await relations()).toEqual({ products: ['2', '3'], badges: ['1'] })

      await expect(
        transaction(db, (tx) =>
          farms.saveRelations('1', { products: [1], badges: [999999] }, tx)
        )
      ).rejects.toMatchObject({ code: '23503' })
      expect(await relations()).toEqual({ products: ['2', '3'], badges: ['1'] })

      await transaction(db, (tx) =>
        farms.saveRelations('1', { products: ['1', '3'] }, tx)
      )
    })
  })

  it('nests the farms of a depot with their products, and initiative goals', async () => {
    expect(
      (await createDepotsRepository(db).findDetailsById('1'))?.farms
    ).toEqual([
      expect.objectContaining({
        id: '1',
        name: 'Beispiel-Farm 1',
        products: [
          expect.objectContaining({ id: '1' }),
          expect.objectContaining({ id: '3' })
        ]
      })
    ])
    expect(
      (await createInitiativesRepository(db).findDetailsById('1'))?.goals
    ).toEqual([
      { id: '1', name: 'land' },
      { id: '2', name: 'staff' }
    ])
  })
})
