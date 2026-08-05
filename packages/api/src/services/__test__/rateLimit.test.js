import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.js'

// disable auth so requests reach the service (rate limiting is checked before it)
vi.mock('../../hooks/authorization')

describe('rate limiting', () => {
  let server
  let baseUrl
  const authMax = 3
  const resetMax = 2

  beforeAll(async () => {
    await setupIntegrationTestDb()
    const app = appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString
      },
      rateLimit: {
        enabled: true,
        auth: { windowMs: 60000, max: authMax },
        passwordReset: { windowMs: 60000, max: resetMax },
        register: { windowMs: 60000, max: 1000 },
        contact: { windowMs: 60000, max: 1000 }
      }
    })
    server = await app.listen(0)
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  afterAll(async () => {
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    )
  })

  afterEach(async () => {
    await truncateTestDb()
  })

  const post = (path, body) =>
    fetch(`${baseUrl}/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })

  const statusesFor = async (times, path, body) => {
    const statuses = []
    for (let i = 0; i < times; i++) {
      const res = await post(path, body)
      statuses.push(res.status)
    }
    return statuses
  }

  it('returns 429 once the /authentication password-login limit is exceeded', async () => {
    const statuses = await statusesFor(authMax + 2, 'authentication', {
      strategy: 'local',
      email: 'nobody@example.com',
      password: 'wrong-password'
    })

    // failed logins are counted (skipSuccessfulRequests), so attempts up to the
    // limit are rejected on credentials, then further attempts are limited.
    expect(statuses.slice(0, authMax).every((s) => s !== 429)).toBe(true)
    expect(statuses[statuses.length - 1]).toBe(429)
  })

  it('does not rate limit JWT re-validation on /authentication', async () => {
    // map-next posts strategy: 'jwt' on startup; a stale token fails but must
    // not consume the password-login budget.
    const statuses = await statusesFor(authMax + 3, 'authentication', {
      strategy: 'jwt',
      accessToken: 'invalid.token'
    })

    expect(statuses.some((s) => s === 429)).toBe(false)
  })

  it('rate limits email-sending authManagement actions', async () => {
    const statuses = await statusesFor(resetMax + 2, 'authManagement', {
      action: 'sendResetPwd',
      value: { email: 'nobody@example.com' }
    })

    expect(statuses[statuses.length - 1]).toBe(429)
  })

  it('does not rate limit authManagement completion actions', async () => {
    // Completing a confirmation/reset must not be blocked by the reset quota.
    const statuses = await statusesFor(resetMax + 3, 'authManagement', {
      action: 'verifySignupLong',
      value: 'invalid-token'
    })

    expect(statuses.some((s) => s === 429)).toBe(false)
  })
})
