import { sql } from 'kysely'
import { SUPERADMIN, startTestServer } from './testServer.ts'

type Server = Awaited<ReturnType<typeof startTestServer>>

// Characterises admin/stats, which the admin dashboard reads, and admin/audit,
// which only the audit email job reads.
describe('admin report services', () => {
  let server: Server

  beforeAll(async () => {
    server = await startTestServer()
  })

  afterAll(() => server.close())

  it('counts the entries and the users per state', async () => {
    await server.db
      .insertInto('users')
      .values([
        { email: 'reminded@example.com', state: 'REMINDER_SENT' },
        { email: 'inactive@example.com', state: 'NO_RESPONSE' },
        { email: 'inactive2@example.com', state: 'NO_RESPONSE' }
      ])
      .execute()
    const superadmin = await server.login(SUPERADMIN)
    try {
      const { status, body } = await superadmin('GET', 'admin/stats')
      // The users are grouped without an order.
      body[3].stats.sort((a: { state: string }, b: { state: string }) =>
        a.state.localeCompare(b.state)
      )
      expect({ status, body }).toEqual({
        status: 200,
        body: [
          { id: 1, resource: 'farms', stats: { count: '1' } },
          { id: 2, resource: 'depots', stats: { count: '1' } },
          { id: 3, resource: 'initiatives', stats: { count: '1' } },
          {
            id: 4,
            resource: 'users',
            stats: [
              { state: 'NO_RESPONSE', count: '2' },
              { state: 'RECENT_LOGIN', count: '4' },
              { state: 'REMINDER_SENT', count: '1' }
            ]
          }
        ]
      })
    } finally {
      await server.db.deleteFrom('users').where('id', '>', '4').execute()
    }
  })

  it('reports the badge changes of the last week as text', async () => {
    const { db } = server
    await sql`truncate audit`.execute(db)
    await db
      .insertInto('farmsBadges')
      .values({ farmId: 1, badgeId: 1 })
      .execute()
    await db
      .insertInto('initiativesBadges')
      .values({ initiativeId: 1, badgeId: 1 })
      .execute()
    // Changes before the last week are left out.
    await sql`update audit set action_timestamp = action_timestamp - interval '8 days'`.execute(
      db
    )
    // Separate statements, so each change gets its own timestamp.
    await db
      .insertInto('farmsBadges')
      .values({ farmId: 1, badgeId: 2 })
      .execute()
    await db
      .insertInto('initiativesBadges')
      .values({ initiativeId: 1, badgeId: 2 })
      .execute()
    await db
      .deleteFrom('farmsBadges')
      .where('farmId', '=', '1')
      .where('badgeId', '=', '1')
      .execute()
    await db
      .deleteFrom('initiativesBadges')
      .where('initiativeId', '=', '1')
      .where('badgeId', '=', '1')
      .execute()

    const report: string[] = await server.app.service('admin/audit').find()

    const timestamp = /^\d\d\.\d\d\.\d{4} \d\d:\d\d - /
    expect(report.every((line) => timestamp.test(line))).toBe(true)
    expect(report.map((line) => line.replace(timestamp, ''))).toEqual([
      'entfernt: Initiative 1, Beispiel-Initiative 1, Berlin',
      'entfernt: Betrieb 1, Beispiel-Farm 1, Berlin',
      'hinzugefügt: Initiative 1, Beispiel-Initiative 1, Berlin',
      'hinzugefügt: Betrieb 1, Beispiel-Farm 1, Berlin'
    ])
  })
})
