import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.js'
import { createTestUser, findUser } from './data/users.js'

vi.mock('../../hooks/email')
vi.mock('../../hooks/authorization')
// Stub the emails service so the reset notifier doesn't render templates in tests.
vi.mock('../../services/emails', () => ({
  __esModule: true,
  default: (app) => app.use('/emails', { create: async () => ({}) })
}))

describe('authManagement enumeration protection', () => {
  let app
  let db
  beforeAll(async () => {
    await setupIntegrationTestDb()
    app = appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString
      }
    })
    db = app.get('kysely')
  })
  afterEach(async () => {
    await truncateTestDb()
  })

  const params = { provider: 'rest', headers: {}, query: {} }

  const sendResetPwd = (email) =>
    app
      .service('authManagement')
      .create({ action: 'sendResetPwd', value: { email } }, params)

  it('returns a generic response for an unknown email (no "User not found")', async () => {
    const result = await sendResetPwd(`missing-${Date.now()}@example.com`)
    expect(result).toEqual({})
  })

  it('returns the same generic response for an existing (unverified) account', async () => {
    const user = await createTestUser(db)
    const result = await sendResetPwd(user.email)
    expect(result).toEqual({})
  })

  it('returns the same generic response for an existing verified account', async () => {
    const user = await createTestUser(db, { isVerified: true })
    const result = await sendResetPwd(user.email)
    expect(result).toEqual({})
  })

  it('is indistinguishable between existing and non-existing accounts', async () => {
    const user = await createTestUser(db)
    const existing = await sendResetPwd(user.email)
    const missing = await sendResetPwd(`missing-${Date.now()}@example.com`)
    expect(existing).toEqual(missing)
  })

  describe('rejected actions', () => {
    const rejection = (data) =>
      app
        .service('authManagement')
        .create(data, params)
        .then(
          () => {
            throw new Error('expected a rejection')
          },
          (error) => error.toJSON()
        )

    it('answers checkUnique identically for a known and an unknown email', async () => {
      const user = await createTestUser(db)
      const known = await rejection({
        action: 'checkUnique',
        value: { email: user.email }
      })
      const unknown = await rejection({
        action: 'checkUnique',
        value: { email: `missing-${Date.now()}@example.com` }
      })
      expect(known).toEqual({
        name: 'BadRequest',
        message: 'Invalid action',
        code: 400,
        className: 'bad-request'
      })
      expect(unknown).toEqual(known)
    })

    it('sends no email for resendVerifySignup', async () => {
      const create = vi.spyOn(app.service('emails'), 'create')
      const user = await createTestUser(db)
      expect(
        await rejection({
          action: 'resendVerifySignup',
          value: { email: user.email }
        })
      ).toMatchObject({ code: 400 })
      expect(create).not.toHaveBeenCalled()
      expect(await findUser(db, user.id)).toEqual(user)
    })

    it.each([
      ['options', { action: 'options' }],
      ['a missing action', { value: {} }]
    ])('rejects %s', async (_, data) => {
      expect(await rejection(data)).toEqual({
        name: 'BadRequest',
        message: 'Invalid action',
        code: 400,
        className: 'bad-request'
      })
    })
  })
})
