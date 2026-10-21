import { Conflict } from '@feathersjs/errors'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import { toFeathersError } from '../../db/errors.ts'
import { createKysely, type Database } from '../../db/kysely.ts'
import { replaceRelation } from '../relations.ts'
import {
  ADMIN_OWNER_COLUMNS,
  OWNER_COLUMNS,
  createUsersRepository
} from '../users.ts'

const SECRET_COLUMNS = [
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

describe('entry building blocks', () => {
  let db: Database

  const farmProducts = async () =>
    (
      await db
        .selectFrom('farmsProducts')
        .select('productId')
        .where('farmId', '=', '1')
        .orderBy('productId')
        .execute()
    ).map(({ productId }) => productId)

  const replaceFarmProducts = (ids: (string | number)[]) =>
    db
      .transaction()
      .execute((trx) =>
        replaceRelation(trx, 'farmsProducts', 'farmId', '1', 'productId', ids)
      )

  beforeAll(async () => {
    await setupIntegrationTestDb()
    db = createKysely({ connection: getTestDbConnectionString })
  })

  afterAll(async () => {
    await db.destroy()
    await truncateTestDb()
  })

  describe('users repository', () => {
    it('finds the admins who watch an origin', async () => {
      const users = createUsersRepository(db)
      await db
        .insertInto('adminsOrigins')
        .values([
          { userId: 2, originId: 1 },
          { userId: 3, originId: 2 },
          // user@example.com is no admin
          { userId: 4, originId: 1 }
        ])
        .execute()

      expect(await users.findAdminsToNotify('http://localhost:3000')).toEqual([
        {
          id: '2',
          email: 'admin@example.com',
          name: 'Teikei Admin 1',
          origin: 'http://localhost:3000',
          baseurl: '/map#',
          locale: 'de-DE'
        }
      ])

      await db
        .updateTable('users')
        .set({ adminEmailNotifications: false })
        .where('id', '=', '3')
        .execute()
      expect(await users.findAdminsToNotify('http://localhost:4000')).toEqual(
        []
      )
      expect(await users.findAdminsToNotify(null)).toEqual([])
    })

    it('never lists a secret column', () => {
      for (const columns of [OWNER_COLUMNS, ADMIN_OWNER_COLUMNS]) {
        expect(
          columns.filter((column) => SECRET_COLUMNS.includes(column))
        ).toEqual([])
      }
    })
  })

  describe('replaceRelation', () => {
    it('adds, removes and keeps ids', async () => {
      expect(await farmProducts()).toEqual(['1', '3'])

      await replaceFarmProducts([5, '3', 2, 5])
      expect(await farmProducts()).toEqual(['2', '3', '5'])

      await replaceFarmProducts(['2', '3', '5'])
      expect(await farmProducts()).toEqual(['2', '3', '5'])
    })

    it('removes every id for an empty list', async () => {
      await replaceFarmProducts([])

      expect(await farmProducts()).toEqual([])
    })

    it('rolls the transaction back with Conflict for an unknown id', async () => {
      await replaceFarmProducts([1])

      const error = await db
        .transaction()
        .execute(async (trx) => {
          await trx
            .updateTable('farms')
            .set({ name: 'rolled back' })
            .where('id', '=', '1')
            .execute()
          await replaceRelation(
            trx,
            'farmsProducts',
            'farmId',
            '1',
            'productId',
            [2, 999999]
          )
        })
        .catch(toFeathersError)

      expect(error).toBeInstanceOf(Conflict)
      expect(await farmProducts()).toEqual(['1'])
      expect(
        await db
          .selectFrom('farms')
          .select('name')
          .where('id', '=', '1')
          .executeTakeFirst()
      ).toEqual({ name: 'Beispiel-Farm 1' })
    })
  })
})
