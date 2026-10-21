import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.js'
import type { Database } from '../../db/kysely.ts'

// Seeded accounts, all with the password 'admin'. The superadmin owns every
// seeded entry.
export const SUPERADMIN = 'superadmin@example.com'
export const ADMIN = 'admin@example.com'
export const USER = 'user@example.com'

// Replaces the timestamps a test run produces itself (createdAt, updatedAt,
// lastLogin) so snapshots stay stable; the seeded ones all predate 2020.
export const stable = (value: unknown): unknown =>
  JSON.parse(JSON.stringify(value), (_, v) =>
    typeof v === 'string' && /^20[2-9]\d-\d\d-\d\dT/.test(v) ? '<recent>' : v
  )

// Starts the app on a random port against the seeded test database, for tests
// that go over HTTP through the real authentication and authorization hooks.
export const startTestServer = async () => {
  await setupIntegrationTestDb()
  const app = appLauncher.startApp({
    postgres: { client: 'pg', connection: getTestDbConnectionString }
  })
  const server: Server = await app.listen(0)
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  const request = async (
    method: string,
    url: string,
    body?: object,
    accessToken?: string
  ) => {
    const response = await fetch(`${baseUrl}/${url}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(accessToken && { authorization: accessToken })
      },
      body: body && JSON.stringify(body)
    })
    return { status: response.status, body: await response.json() }
  }

  const login = async (email: string) => {
    const { body } = await request('POST', 'authentication', {
      strategy: 'local',
      email,
      password: 'admin'
    })
    return (method: string, url: string, data?: object) =>
      request(method, url, data, body.accessToken)
  }

  return {
    app,
    db: app.get('kysely') as Database,
    guest: (method: string, url: string, data?: object) =>
      request(method, url, data),
    login,
    close: async () => {
      await new Promise((resolve) => server.close(resolve))
      await truncateTestDb()
    }
  }
}
