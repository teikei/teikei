import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import appLauncher from '../../app.ts'
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

// The account fields no response may contain, at any depth.
const SECRET_FIELDS = [
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

export const secretsIn = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap(secretsIn)
    : value && typeof value === 'object'
      ? Object.entries(value).flatMap(([key, v]) => [
          ...(SECRET_FIELDS.includes(key) ? [key] : []),
          ...secretsIn(v)
        ])
      : []

// Feathers types `create` with its hook overloads, which vi.spyOn picks up.
// The tests only stub how emails are sent; `never` lets each one type the
// data it reads.
export const emailsService = (app: { service(path: string): unknown }) =>
  app.service('emails') as { create(data: never): Promise<unknown> }

// Starts the app on a random port against the seeded test database, for tests
// that go over HTTP through the real authentication and authorization hooks.
// The configuration overrides are set before the services are configured, so
// they reach hooks that read the configuration once, like the feature toggles.
export const startTestServer = async (configuration: object = {}) => {
  await setupIntegrationTestDb()
  const app = appLauncher.startApp({
    postgres: { client: 'pg', connection: getTestDbConnectionString },
    ...configuration
  })
  const server: Server = await app.listen(0)
  // Every response body, for the secrets check.
  const responses: unknown[] = []
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
    const json = await response.json()
    responses.push(json)
    return { status: response.status, body: json }
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
    baseUrl,
    db: app.get('kysely') as Database,
    responses,
    guest: (method: string, url: string, data?: object) =>
      request(method, url, data),
    login,
    close: async () => {
      await new Promise((resolve) => server.close(resolve))
      await truncateTestDb()
    }
  }
}
