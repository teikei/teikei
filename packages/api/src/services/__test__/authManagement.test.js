import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup'
import appLauncher from '../../app'
import User from '../../models/users'
import { createTestUser } from './data/users'

vi.mock('../../hooks/email')
vi.mock('../../hooks/authorization')
// Stub the emails service so the reset notifier doesn't render templates in tests.
vi.mock('../../services/emails', () => ({
  __esModule: true,
  default: (app) => app.use('/emails', { create: async () => ({}) })
}))

describe('authManagement enumeration protection', () => {
  let app
  beforeAll(async () => {
    await setupIntegrationTestDb()
    app = appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString
      }
    })
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
    const user = await createTestUser(app.service('users'), params)
    const result = await sendResetPwd(user.email)
    expect(result).toEqual({})
  })

  it('returns the same generic response for an existing verified account', async () => {
    const user = await createTestUser(app.service('users'), params)
    await User.query().findById(user.id).patch({ isVerified: true })
    const result = await sendResetPwd(user.email)
    expect(result).toEqual({})
  })

  it('is indistinguishable between existing and non-existing accounts', async () => {
    const user = await createTestUser(app.service('users'), params)
    const existing = await sendResetPwd(user.email)
    const missing = await sendResetPwd(`missing-${Date.now()}@example.com`)
    expect(existing).toEqual(missing)
  })

  it('does not leak account state via resendVerifySignup', async () => {
    const data = {
      action: 'resendVerifySignup',
      value: { email: `missing-${Date.now()}@example.com` }
    }
    const result = await app.service('authManagement').create(data, params)
    expect(result).toEqual({})
  })
})
