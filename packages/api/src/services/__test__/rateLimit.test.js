import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup'
import appLauncher from '../../app'

// disable auth so requests reach the service (rate limiting is checked before it)
jest.mock('../../hooks/authorization')

describe('rate limiting', () => {
  let server
  let baseUrl
  const authMax = 3

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
        passwordReset: { windowMs: 60000, max: 1000 },
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

  const login = () =>
    fetch(`${baseUrl}/authentication`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        strategy: 'local',
        email: 'nobody@example.com',
        password: 'wrong-password'
      })
    })

  it('returns 429 once the /authentication limit is exceeded', async () => {
    const statuses = []
    for (let i = 0; i < authMax + 2; i++) {
      const res = await login()
      statuses.push(res.status)
    }

    // failed logins are counted (skipSuccessfulRequests), so the attempts up to
    // the limit are rejected on credentials, then further attempts are limited.
    expect(statuses.slice(0, authMax).every((s) => s !== 429)).toBe(true)
    expect(statuses[statuses.length - 1]).toBe(429)
  })
})
