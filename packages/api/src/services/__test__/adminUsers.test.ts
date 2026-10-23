import type { Application, HookContext } from '@feathersjs/feathers'
import axios from 'axios'
import { sql } from 'kysely'
import { setEmailTemplateOriginLocals } from '../../hooks/email.ts'
import configureImportEmailBounces from '../../jobs/importEmailBounces.ts'
import configureAuditEmail from '../../jobs/sendAuditEmail.ts'
import { findUser } from './data/users.js'
import {
  ADMIN,
  SUPERADMIN,
  emailsService,
  secretsIn,
  stable,
  startTestServer
} from './testServer.ts'

type Server = Awaited<ReturnType<typeof startTestServer>>
type Login = Awaited<ReturnType<Server['login']>>
type AuditEmail = {
  template: string
  message: { to: string }
  locals: { locale: string; user: { origin: string } }
}

// Characterises admin/users with the query strings packages/admin sends
// (src/repositories/users.ts), and the other user endpoints and jobs. The
// admin (id 2) administers http://localhost:3000, where the superadmin (1),
// the admin, the user (4) and the bounced user (6) come from; admin2 (3) and
// the other user (5) come from http://localhost:4000.
describe('admin user services', () => {
  let server: Server
  let superadmin: Login
  let admin: Login

  const ids = ({ body }: { body: { data: { id: string }[] } }) =>
    body.data.map(({ id }) => id)

  beforeAll(async () => {
    server = await startTestServer()
    const { db } = server
    await db
      .insertInto('adminsOrigins')
      .values({ userId: 2, originId: 1 })
      .execute()
    await db
      .insertInto('users')
      .values([
        {
          email: 'other@example.com',
          name: 'Other',
          phone: '5678',
          origin: 'http://localhost:4000',
          isVerified: false,
          state: 'REMINDER_SENT',
          adminEmailNotifications: false
        },
        {
          email: 'bounced@example.com',
          name: 'Bounced',
          origin: 'http://localhost:3000',
          isVerified: true,
          bounceType: 'HardBounce',
          bounceName: 'Hard Bounce'
        }
      ])
      .execute()
    await db
      .insertInto('usersRoles')
      .values([
        { userId: 5, roleId: 1 },
        { userId: 6, roleId: 1 }
      ])
      .execute()

    superadmin = await server.login(SUPERADMIN)
    admin = await server.login(ADMIN)
  })

  afterAll(() => server.close())

  describe('admin/users find', () => {
    it.each([
      ['$limit=25&$skip=0&$sort[id]=1'],
      ['$limit=25&$skip=0&$sort[id]=1&$details=true'],
      ['$limit=2&$skip=2&$sort[email]=-1']
    ])('lists %s as superadmin', async (query) => {
      expect(
        stable(await superadmin('GET', `admin/users?${query}`))
      ).toMatchSnapshot()
    })

    it('lists only the own origins and the admin as admin', async () => {
      expect(
        stable(await admin('GET', 'admin/users?$limit=25&$skip=0&$sort[id]=1'))
      ).toMatchSnapshot()
    })

    it.each([
      ['q=admin', ['1', '2', '3']],
      ['q=ADMIN2', ['3']],
      ['name=Admin', ['1', '2', '3']],
      ['email=bounced', ['6']],
      // with q, name is matched exactly
      ['q=other&name=Oth', []],
      ['q=other&name=Other', ['5']],
      ['id=3', ['3']],
      ['phone=5678', ['5']],
      ['isVerified=false', ['5']],
      ['adminEmailNotifications=false', ['5']],
      ['origin=http://localhost:4000', ['3', '5']],
      ['state=REMINDER_SENT', ['5']],
      ['roles.id=2', ['1', '2', '3']],
      ['roles.id=3', ['1']],
      ['roles.id=2&origin=http://localhost:4000', ['3']],
      ['id[$in][]=5&id[$in][]=1&$limit=2', ['1', '5']]
    ])('filters %s', async (query, expected) => {
      expect(
        ids(await superadmin('GET', `admin/users?${query}&$sort[id]=1`))
      ).toEqual(expected)
    })

    it('filters by role within the own origins as admin', async () => {
      expect(
        ids(await admin('GET', 'admin/users?roles.id=1&$sort[id]=1'))
      ).toEqual(['1', '2', '4', '6'])
    })
  })

  describe('admin/users get', () => {
    it('gets a user with relation ids', async () => {
      expect(stable(await admin('GET', 'admin/users/1'))).toMatchSnapshot()
    })

    it('gets a user with relation records', async () => {
      expect(
        stable(await admin('GET', 'admin/users/1?$details=true'))
      ).toMatchSnapshot()
    })

    it('answers 404 for a missing id', async () => {
      expect((await superadmin('GET', 'admin/users/999999')).status).toBe(404)
    })
  })

  describe('admin/users writes', () => {
    let createdId: string

    it('creates a user', async () => {
      const response = await superadmin('POST', 'admin/users', {
        email: 'created@example.com',
        name: 'Created',
        roles: [1, 2]
      })
      createdId = response.body.id
      expect(stable(response)).toMatchSnapshot()
    })

    it('patches roles and admin origins', async () => {
      const response = await superadmin('PATCH', `admin/users/${createdId}`, {
        name: 'Patched',
        roles: [1],
        adminOrigins: [1, 2]
      })
      expect(stable(response)).toMatchSnapshot()
      expect(
        stable(await superadmin('GET', `admin/users/${createdId}`))
      ).toMatchSnapshot()
    })

    it('rejects an unknown role id and writes nothing', async () => {
      const response = await superadmin('PATCH', `admin/users/${createdId}`, {
        name: 'Unknown Role',
        roles: [1, 999]
      })
      expect(stable(response)).toMatchSnapshot()
      expect(
        stable(await superadmin('GET', `admin/users/${createdId}`))
      ).toMatchSnapshot()
    })

    it('patches the allowed fields as admin', async () => {
      expect(
        stable(
          await admin('PATCH', `admin/users/${createdId}`, { phone: '999' })
        )
      ).toMatchSnapshot()
    })

    it('removes a user', async () => {
      expect(
        stable(await admin('DELETE', `admin/users/${createdId}`))
      ).toMatchSnapshot()
      expect((await superadmin('GET', `admin/users/${createdId}`)).status).toBe(
        404
      )
    })

    it("lists a user's entries", async () => {
      expect(
        stable(await admin('GET', 'admin/users/1/entries'))
      ).toMatchSnapshot()
    })
  })

  describe('admin/bounces', () => {
    // Bounces of the admin origins, for every role.
    it('lists the bounces of the own origins', async () => {
      expect(await admin('GET', 'admin/bounces')).toEqual({
        status: 200,
        body: [
          {
            id: '6',
            email: 'bounced@example.com',
            name: 'Bounced',
            bounceType: 'HardBounce',
            bounceName: 'Hard Bounce'
          }
        ]
      })
      expect(await superadmin('GET', 'admin/bounces')).toEqual({
        status: 200,
        body: []
      })
    })
  })

  describe('admin/user-account-state-change', () => {
    it('deactivates and reactivates the user and their entries', async () => {
      const { db } = server
      const activeOf = async () => ({
        user: (await findUser(db, '1')).active,
        farm: (
          await db
            .selectFrom('farms')
            .select('active')
            .where('id', '=', '1')
            .executeTakeFirstOrThrow()
        ).active,
        depot: (
          await db
            .selectFrom('depots')
            .select('active')
            .where('id', '=', '1')
            .executeTakeFirstOrThrow()
        ).active,
        initiative: (
          await db
            .selectFrom('initiatives')
            .select('active')
            .where('id', '=', '1')
            .executeTakeFirstOrThrow()
        ).active
      })
      await db
        .insertInto('farmsDepots')
        .values({ farmId: 1, depotId: 1 })
        .execute()

      expect(
        await admin('POST', 'admin/user-account-state-change', {
          id: 1,
          active: false
        })
      ).toEqual({ status: 201, body: 'User reactivated.' })
      expect(await activeOf()).toEqual({
        user: false,
        farm: false,
        depot: false,
        initiative: false
      })

      expect(
        await admin('POST', 'admin/user-account-state-change', {
          id: 1,
          active: true
        })
      ).toEqual({ status: 201, body: 'User reactivated.' })
      expect(await activeOf()).toEqual({
        user: true,
        farm: true,
        depot: true,
        initiative: true
      })
    })

    it('changes nothing when the entries fail to update', async () => {
      const { db } = server
      await sql`
        create function fail_update() returns trigger as $$
        begin raise exception 'update failed'; end $$ language plpgsql;
        create trigger fail_update before update on initiatives
        for each row execute function fail_update();
      `.execute(db)
      try {
        expect(
          (
            await admin('POST', 'admin/user-account-state-change', {
              id: 1,
              active: false
            })
          ).status
        ).toBe(500)
      } finally {
        await sql`
          drop trigger fail_update on initiatives;
          drop function fail_update();
        `.execute(db)
      }
      expect(await findUser(db, '1')).toMatchObject({ active: true })
      expect(
        await db
          .selectFrom('farms')
          .select('active')
          .where('id', '=', '1')
          .executeTakeFirstOrThrow()
      ).toEqual({ active: true })
    })

    it('rejects a missing flag', async () => {
      expect(
        await admin('POST', 'admin/user-account-state-change', { id: 1 })
      ).toMatchSnapshot()
    })
  })

  describe('user-reactivation', () => {
    const setState = (state: string, reactivationToken: string | null) =>
      server.db
        .updateTable('users')
        .set({ state, reactivationToken })
        .where('id', '=', '5')
        .execute()

    it('answers for an active user', async () => {
      await setState('RECENT_LOGIN', null)
      expect(
        await server.guest('POST', 'user-reactivation', { id: 5, token: 'x' })
      ).toEqual({
        status: 201,
        body: 'User is active, no login state reset required.'
      })
    })

    it('resets the login state with the token', async () => {
      await setState('SECOND_REMINDER_SENT', 'the-token')
      expect(
        await server.guest('POST', 'user-reactivation', {
          id: 5,
          token: 'the-token'
        })
      ).toEqual({
        status: 201,
        body: 'User login recorded, state has been reset.'
      })
      expect(stable(await findUser(server.db, '5'))).toMatchObject({
        state: 'RECENT_LOGIN',
        lastLogin: '<recent>',
        reactivationToken: null
      })
    })

    it('rejects a wrong token', async () => {
      await setState('REMINDER_SENT', 'the-token')
      expect(
        await server.guest('POST', 'user-reactivation', {
          id: 5,
          token: 'wrong'
        })
      ).toMatchSnapshot()
      expect(await findUser(server.db, '5')).toMatchObject({
        state: 'REMINDER_SENT',
        reactivationToken: 'the-token'
      })
    })
  })

  describe('jobs', () => {
    // The scheduler is off in tests, so the jobs register their callbacks
    // here and run them directly.
    const jobCallback = (configure: (app: Application) => void) => {
      let run: () => Promise<void> = async () => {}
      configure(
        Object.assign(Object.create(server.app), {
          jobs: {
            schedule: (_: number, __: string, ___: string, cb: typeof run) => {
              run = cb
            }
          }
        })
      )
      return run
    }

    it('sends the audit email to the recipients found by email', async () => {
      const { app } = server
      const mailer = app.get('mailer')
      app.set('mailer', {
        ...mailer,
        auditRecipients:
          'admin@example.com,superadmin@example.com,nobody@example.com'
      })
      const create = vi
        .spyOn(emailsService(app), 'create')
        .mockResolvedValue({})
      try {
        await jobCallback(configureAuditEmail)()
      } finally {
        app.set('mailer', mailer)
      }
      expect(
        (create.mock.calls as [AuditEmail][])
          .map(([data]) => ({
            template: data.template,
            to: data.message.to,
            locale: data.locals.locale,
            // what the origin locals are looked up by
            origin: data.locals.user.origin
          }))
          .sort((a, b) => a.to.localeCompare(b.to))
      ).toEqual([
        {
          template: 'admin_audit',
          to: 'admin@example.com',
          locale: 'de-DE',
          origin: 'http://localhost:3000'
        },
        {
          template: 'admin_audit',
          to: 'superadmin@example.com',
          locale: 'de-DE',
          origin: 'http://localhost:3000'
        }
      ])
    })

    it('records the Postmark suppressions on the users', async () => {
      const { app } = server
      const mailer = app.get('mailer')
      app.set('mailer', {
        ...mailer,
        transport: 'postmarkSandboxTransport',
        postmarkSandboxTransport: { auth: { apiKey: 'sandbox-token' } }
      })
      const get = vi.spyOn(axios, 'get').mockResolvedValue({
        data: {
          Suppressions: [
            {
              EmailAddress: 'user@example.com',
              SuppressionReason: 'ManualSuppression'
            },
            {
              EmailAddress: 'missing@example.com',
              SuppressionReason: 'HardBounce'
            }
          ]
        }
      })
      try {
        await jobCallback(configureImportEmailBounces)()
      } finally {
        app.set('mailer', mailer)
      }
      expect(get).toHaveBeenCalledWith(
        'https://api.postmarkapp.com/message-streams/broadcast/suppressions/dump',
        { headers: { 'X-Postmark-Server-Token': 'sandbox-token' } }
      )
      expect(await findUser(server.db, '4')).toMatchObject({
        bounceType: 'ManualSuppression',
        bounceName: 'Unsubscribed'
      })
    })
  })

  describe('email origin locals', () => {
    const localsFor = async (origin: string) => {
      const ctx = {
        app: server.app,
        params: {},
        data: { locals: { user: { origin } } }
      }
      await setEmailTemplateOriginLocals(ctx as unknown as HookContext)
      return ctx.data.locals
    }

    it("adds the configuration of the user's origin", async () => {
      expect(await localsFor('http://localhost:4000')).toEqual({
        user: { origin: 'http://localhost:4000' },
        id: '2',
        origin: 'http://localhost:4000',
        baseurl: '/#',
        originName: 'Teikei 2',
        organizationName: 'Teikei 2 Example Organization',
        organizationEmail: 'superadmin@example.com'
      })
    })

    it('falls back to the default origin', async () => {
      await server.db
        .insertInto('origins')
        .values({ origin: 'default', originName: 'Default' })
        .execute()
      expect(await localsFor('http://unknown.example')).toMatchObject({
        origin: 'default',
        originName: 'Default'
      })
    })
  })

  // Last, so it sees the responses of every test above, admin/bounces and
  // user-reactivation included.
  it('exposes no account secrets in any response', () => {
    expect(server.responses.length).toBeGreaterThan(40)
    expect(secretsIn(server.responses)).toEqual([])
  })
})
