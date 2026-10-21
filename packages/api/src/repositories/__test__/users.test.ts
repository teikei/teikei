import { DatabaseError } from 'pg'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import { createKysely, type Database } from '../../db/kysely.ts'
import { createUsersRepository } from '../users.ts'

const SECRETS = [
  'password',
  'reactivationToken',
  'verifyToken',
  'verifyShortToken',
  'verifyExpires',
  'verifyChanges',
  'resetToken',
  'resetShortToken',
  'resetExpires'
]

// Every key at any depth, so nested relation records are covered too.
const keysOf = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap(keysOf)
    : value && typeof value === 'object'
      ? Object.entries(value).flatMap(([key, v]) => [key, ...keysOf(v)])
      : []

// Seeds: the superadmin (1) has every role, the admins (2, 3) user and admin,
// the user (4) user; 1, 2 and 4 come from http://localhost:3000, 3 from
// http://localhost:4000.
describe('users repository', () => {
  let db: Database
  let users: ReturnType<typeof createUsersRepository>

  beforeAll(async () => {
    await setupIntegrationTestDb()
    db = createKysely({ connection: getTestDbConnectionString })
    users = createUsersRepository(db)
    await db
      .updateTable('users')
      .set({
        reactivationToken: 'reactivation',
        verifyToken: 'verify',
        resetToken: 'reset',
        bounceType: 'HardBounce'
      })
      .where('id', '=', '4')
      .execute()
    await db
      .insertInto('adminsOrigins')
      .values({ userId: 2, originId: 1 })
      .execute()
  })

  afterAll(async () => {
    await db.destroy()
    await truncateTestDb()
  })

  it('reads no secrets outside the account reads', async () => {
    const reads = [
      await users.findByEmails(['user@example.com']),
      await users.findAdminPage({}, {}, { details: false }),
      await users.findAdminPage({}, {}, { details: true }),
      await users.findAdminById('2', { details: false }),
      await users.findAdminById('2', { details: true }),
      await users.findBounced(['http://localhost:3000']),
      await users.findAdminsToNotify('http://localhost:3000'),
      await users.update('4', { name: 'Teikei User' }),
      await users.delete(
        (await users.insert({ email: 'new@example.com', password: 'x' })).id
      ),
      await users.saveRelations('2', { roles: [1, 2], adminOrigins: [1] })
    ]
    expect(keysOf(reads).filter((key) => SECRETS.includes(key))).toEqual([])
  })

  it('reads the reactivation token only with the state', async () => {
    expect(await users.findReactivation('4')).toEqual({
      id: '4',
      state: 'RECENT_LOGIN',
      reactivationToken: 'reactivation'
    })
  })

  it('reads accounts with every column', async () => {
    const [account] = await users.findAccountsByEmail('user@example.com', 2)
    expect(Object.keys(account)).toEqual(expect.arrayContaining(SECRETS))
    expect(await users.findAccountsByVerifyToken('verify')).toEqual([account])
    expect(await users.findAccountById('4')).toEqual({
      ...account,
      roles: [{ id: '1', name: 'user' }],
      adminOrigins: []
    })
  })

  describe('saveRelations', () => {
    const relationsOf = async (id: string) => {
      const { roles, adminOrigins } = (await users.findAdminById(id, {
        details: false
      }))!
      return { roles, adminOrigins }
    }

    it('replaces the given relations and keeps the others', async () => {
      const saved = await users.saveRelations('3', { roles: [2, 3] })
      expect(saved).toEqual({
        roles: [
          { id: '2', name: 'admin' },
          { id: '3', name: 'superadmin' }
        ]
      })
      await users.saveRelations('3', { adminOrigins: [2] })
      expect(await relationsOf('3')).toEqual({
        roles: ['2', '3'],
        adminOrigins: ['2']
      })
    })

    it('fails on an unknown id', async () => {
      const save = db
        .transaction()
        .execute((tx) => users.saveRelations('3', { roles: [999] }, tx))
      await expect(save).rejects.toBeInstanceOf(DatabaseError)
      await expect(save).rejects.toMatchObject({ code: '23503' })
      expect((await relationsOf('3')).roles).toEqual(['2', '3'])
    })
  })

  it('activates only the entries of the user', async () => {
    // A second farm with a depot, owned by the admin.
    const farm = await db
      .insertInto('farms')
      .values({ name: 'Other', latitude: 1, longitude: 1 })
      .returning('id')
      .executeTakeFirstOrThrow()
    const depot = await db
      .insertInto('depots')
      .values({ name: 'Other', latitude: 1, longitude: 1 })
      .returning('id')
      .executeTakeFirstOrThrow()
    await db
      .insertInto('farmsUsers')
      .values({ farmId: farm.id, userId: 2 })
      .execute()
    await db
      .insertInto('farmsDepots')
      .values([
        { farmId: farm.id, depotId: depot.id },
        { farmId: 1, depotId: 1 }
      ])
      .execute()

    const active = async (table: 'farms' | 'depots' | 'initiatives') =>
      (
        await db
          .selectFrom(table)
          .select(['id', 'active'])
          .orderBy('id')
          .execute()
      ).map((row) => [row.id, row.active])

    await users.setEntriesActive('1', false)
    expect({
      farms: await active('farms'),
      depots: await active('depots'),
      initiatives: await active('initiatives')
    }).toEqual({
      farms: [
        ['1', false],
        [farm.id, true]
      ],
      depots: [
        ['1', false],
        [depot.id, true]
      ],
      initiatives: [['1', false]]
    })
  })

  describe('findAdminPage', () => {
    const ids = async (filters: Parameters<typeof users.findAdminPage>[1]) =>
      (
        await users.findAdminPage({ $sort: { id: 1 } }, filters, {
          details: false
        })
      ).data.map(({ id }) => id)

    it('filters by role', async () => {
      expect(await ids({ withRole: '3' })).toEqual(['1', '3'])
    })

    it('restricts to the origins and the user', async () => {
      expect(
        await ids({
          visibleTo: { origins: ['http://localhost:4000'], userId: '2' }
        })
      ).toEqual(['2', '3'])
      expect(await ids({ visibleTo: { origins: [], userId: '2' } })).toEqual([
        '2'
      ])
    })

    it('combines both with the search', async () => {
      const page = await users.findAdminPage(
        { q: 'admin', $sort: { id: 1 } },
        {
          withRole: '2',
          visibleTo: { origins: ['http://localhost:3000'], userId: '3' }
        },
        { details: false }
      )
      expect(page.data.map(({ id }) => id)).toEqual(['1', '2', '3'])
    })
  })
})
