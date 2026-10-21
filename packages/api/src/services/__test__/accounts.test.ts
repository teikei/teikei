import { jwtDecode } from 'jwt-decode'
import { createTestUser, findUser, newUserData } from './data/users.js'
import { secretsIn, startTestServer } from './testServer.ts'

type Server = Awaited<ReturnType<typeof startTestServer>>
type User = Awaited<ReturnType<typeof createTestUser>>
type Email = {
  template: string
  message: { to: string }
  locals: { user: { resetToken: string } }
}

// Characterises the self-service account flows as the embed app and the legacy
// map call them: sign-up, sign-in, the own account, and the authManagement
// actions they send.
describe('account flows', () => {
  let server: Server
  let sentEmails: Email[]

  // Stands in for what varies between runs, so the bodies can be compared
  // whole.
  const scrub = (value: unknown, user?: User) =>
    JSON.parse(JSON.stringify(value), (_, v) => {
      if (typeof v !== 'string') {
        return v
      }
      if (user && v === user.id) {
        return '<id>'
      }
      if (user && v === user.email) {
        return '<email>'
      }
      if (user && v === `/users/${user.id}`) {
        return '/users/<id>'
      }
      if (/^eyJ/.test(v)) {
        return '<jwt>'
      }
      return /^20[2-9]\d-\d\d-\d\dT/.test(v) ? '<recent>' : v
    })

  const signIn = (email: string, password: string) =>
    server.guest('POST', 'authentication', {
      strategy: 'local',
      email,
      password
    })

  const signedIn = async (user: User, password = 'guest') => {
    const { body } = await signIn(user.email!, password)
    return (method: string, url: string, data?: object) =>
      request(method, url, data, body.accessToken)
  }

  // Sign-up stores the Origin header; the clients always send one.
  const request = async (
    method: string,
    url: string,
    data?: object,
    accessToken?: string
  ) => {
    const response = await fetch(`${server.baseUrl}/${url}`, {
      method,
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        ...(accessToken && { authorization: accessToken })
      },
      body: data && JSON.stringify(data)
    })
    const body = await response.json()
    server.responses.push(body)
    return { status: response.status, body }
  }

  beforeAll(async () => {
    server = await startTestServer()
  })

  afterAll(() => server.close())

  beforeEach(() => {
    sentEmails = []
    vi.spyOn(server.app.service('emails'), 'create').mockImplementation(
      async (data: Email) => {
        sentEmails.push(data)
        return {}
      }
    )
  })

  const authManagement = (data: object) =>
    request('POST', 'authManagement', data)

  describe('sign-up', () => {
    it('creates an unverified account with the user role', async () => {
      const data = newUserData()
      const { status, body } = await request('POST', 'users', data)

      const user = await findUser(server.db, body.id)
      expect({ status, body: scrub(body, user) }).toMatchInlineSnapshot(`
        {
          "body": {
            "active": true,
            "adminEmailNotifications": true,
            "bounceName": null,
            "bounceType": null,
            "createdAt": "<recent>",
            "email": "<email>",
            "id": "<id>",
            "isVerified": false,
            "lastLogin": null,
            "link": "/users/<id>",
            "locale": "de-DE",
            "name": "Guest",
            "phone": "1234",
            "reminderSentAt": null,
            "secondReminderSentAt": null,
            "state": "RECENT_LOGIN",
            "type": "User",
            "updatedAt": null,
          },
          "status": 201,
        }
      `)

      expect(scrub(user, user)).toMatchObject({
        origin: 'http://localhost:3000',
        isVerified: false,
        verifyToken: expect.any(String),
        verifyShortToken: expect.any(String),
        verifyExpires: expect.any(String),
        verifyChanges: {}
      })
      const roles = await server.db
        .selectFrom('usersRoles')
        .innerJoin('roles', 'roles.id', 'usersRoles.roleId')
        .select('roles.name')
        .where('usersRoles.userId', '=', user.id)
        .execute()
      expect(roles).toEqual([{ name: 'user' }])
      expect(sentEmails.map(({ template }) => template)).toEqual([
        'confirmation_instructions'
      ])
    })

    it('verifies the account and signs in with the user role', async () => {
      const data = newUserData()
      const { body: created } = await request('POST', 'users', data)
      const { verifyToken } = await findUser(server.db, created.id)

      const verified = await authManagement({
        action: 'verifySignupLong',
        value: verifyToken
      })
      const user = await findUser(server.db, created.id)
      expect(scrub(verified, user)).toMatchInlineSnapshot(`
        {
          "body": {
            "active": true,
            "adminEmailNotifications": true,
            "baseurl": null,
            "bounceName": null,
            "bounceType": null,
            "createdAt": "<recent>",
            "email": "<email>",
            "id": "<id>",
            "isVerified": true,
            "lastLogin": null,
            "locale": "de-DE",
            "name": "Guest",
            "origin": "http://localhost:3000",
            "phone": "1234",
            "reminderSentAt": null,
            "resetAttempts": null,
            "secondReminderSentAt": null,
            "state": "RECENT_LOGIN",
            "updatedAt": "<recent>",
          },
          "status": 201,
        }
      `)

      const { status, body } = await signIn(data.email, data.password)
      expect({ status, body: scrub(body, user) }).toMatchInlineSnapshot(`
        {
          "body": {
            "accessToken": "<jwt>",
            "user": {
              "email": "<email>",
              "id": "<id>",
              "locale": "de-DE",
              "name": "Guest",
              "phone": "1234",
            },
          },
          "status": 201,
        }
      `)
      const { sub, roles } = jwtDecode<{ sub: string; roles: unknown }>(
        body.accessToken
      )
      expect(scrub({ sub, roles }, user)).toMatchInlineSnapshot(`
        {
          "roles": [
            {
              "id": "1",
              "link": "/roles/1",
              "name": "user",
              "type": "Role",
            },
          ],
          "sub": "<id>",
        }
      `)
    })
  })

  describe('sign-in', () => {
    it('rejects an unverified account', async () => {
      const user = await createTestUser(server.db)
      expect(await signIn(user.email!, 'guest')).toMatchInlineSnapshot(`
        {
          "body": {
            "className": "bad-request",
            "code": 400,
            "data": {
              "errorCode": "EMAIL_NOT_VERIFIED",
            },
            "message": "User's email is not yet verified.",
            "name": "BadRequest",
          },
          "status": 400,
        }
      `)
    })

    it('rejects a wrong password', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      expect(await signIn(user.email!, 'wrong')).toMatchInlineSnapshot(`
        {
          "body": {
            "className": "not-authenticated",
            "code": 401,
            "data": {
              "errorCode": "INVALID_CREDENTIALS",
            },
            "message": "Invalid login",
            "name": "NotAuthenticated",
          },
          "status": 401,
        }
      `)
    })

    it('records the login and reactivates the entries', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      await server.db
        .updateTable('users')
        .set({ active: false, state: 'SECOND_REMINDER_SENT' })
        .where('id', '=', user.id)
        .execute()

      expect((await signIn(user.email!, 'guest')).status).toBe(201)

      const stored = await findUser(server.db, user.id)
      expect(scrub(stored, user)).toMatchObject({
        active: true,
        state: 'RECENT_LOGIN',
        lastLogin: '<recent>',
        reminderSentAt: null,
        secondReminderSentAt: null,
        reactivationToken: null
      })
    })
  })

  describe('own account', () => {
    it('gets the own account', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      const api = await signedIn(user)
      const { status, body } = await api('GET', `users/${user.id}`)
      expect({ status, body: scrub(body, user) }).toMatchInlineSnapshot(`
        {
          "body": {
            "active": true,
            "adminEmailNotifications": true,
            "adminOrigins": [],
            "baseurl": null,
            "bounceName": null,
            "bounceType": null,
            "createdAt": "<recent>",
            "email": "<email>",
            "id": "<id>",
            "isVerified": true,
            "lastLogin": "<recent>",
            "link": "/users/<id>",
            "locale": "de-DE",
            "name": "Guest",
            "origin": null,
            "phone": "1234",
            "reminderSentAt": null,
            "roles": [
              {
                "id": "1",
                "link": "/roles/1",
                "name": "user",
                "type": "Role",
              },
            ],
            "secondReminderSentAt": null,
            "state": "RECENT_LOGIN",
            "type": "User",
            "updatedAt": "<recent>",
          },
          "status": 200,
        }
      `)
    })

    it("forbids another user's account", async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      const api = await signedIn(user)
      expect(await api('GET', 'users/1')).toMatchInlineSnapshot(`
        {
          "body": {
            "className": "forbidden",
            "code": 403,
            "data": {
              "errorCode": "FORBIDDEN",
            },
            "message": "You are not allowed to get users.",
            "name": "Forbidden",
          },
          "status": 403,
        }
      `)
    })

    it('patches the profile with the password, ignoring server-managed fields', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      const api = await signedIn(user)
      const before = await findUser(server.db, user.id)

      const { status, body } = await api('PATCH', `users/${user.id}`, {
        name: 'New Name',
        phone: '5678',
        password: 'guest',
        active: false,
        state: 'INACTIVE',
        origin: 'https://attacker.example',
        reactivationToken: 'attacker'
      })
      expect({ status, body: scrub(body, user) }).toMatchInlineSnapshot(`
        {
          "body": {
            "active": true,
            "adminEmailNotifications": true,
            "baseurl": null,
            "bounceName": null,
            "bounceType": null,
            "createdAt": "<recent>",
            "email": "<email>",
            "id": "<id>",
            "isVerified": true,
            "lastLogin": "<recent>",
            "link": "/users/<id>",
            "locale": "de-DE",
            "name": "New Name",
            "origin": null,
            "phone": "5678",
            "reminderSentAt": null,
            "secondReminderSentAt": null,
            "state": "RECENT_LOGIN",
            "type": "User",
            "updatedAt": "<recent>",
          },
          "status": 200,
        }
      `)

      const after = await findUser(server.db, user.id)
      expect(after).toMatchObject({
        name: 'New Name',
        phone: '5678',
        active: before.active,
        state: before.state,
        origin: before.origin,
        reactivationToken: before.reactivationToken
      })
    })

    it('rejects a patch without the password', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      const api = await signedIn(user)
      expect(await api('PATCH', `users/${user.id}`, { name: 'New Name' }))
        .toMatchInlineSnapshot(`
        {
          "body": {
            "className": "not-authenticated",
            "code": 401,
            "data": {
              "errorCode": "PASSWORD_REQUIRED",
            },
            "message": "Missing password for verification",
            "name": "NotAuthenticated",
          },
          "status": 401,
        }
      `)
    })

    it.each([
      ['GET', 'users'],
      ['PUT', 'users/1'],
      ['DELETE', 'users/1']
    ])('rejects %s %s', async (method, url) => {
      const user = await createTestUser(server.db, { isVerified: true })
      const api = await signedIn(user)
      const body = method === 'PUT' ? {} : undefined
      expect((await api(method, url, body)).status).toBe(405)
      expect((await request(method, url, body)).status).toBe(405)
    })
  })

  describe('verifySignupLong', () => {
    it('rejects an unknown token', async () => {
      expect(
        await authManagement({ action: 'verifySignupLong', value: 'unknown' })
      ).toMatchInlineSnapshot(`
        {
          "body": {
            "className": "bad-request",
            "code": 400,
            "data": {
              "errorCode": "USER_NOT_FOUND",
            },
            "errors": {
              "$className": "badParams",
            },
            "message": "User not found.",
            "name": "BadRequest",
          },
          "status": 400,
        }
      `)
    })

    it('rejects an expired token', async () => {
      const user = await createTestUser(server.db)
      await server.db
        .updateTable('users')
        .set({
          verifyToken: 'expired-token',
          verifyExpires: new Date(Date.now() - 1000)
        })
        .where('id', '=', user.id)
        .execute()
      expect(
        await authManagement({
          action: 'verifySignupLong',
          value: 'expired-token'
        })
      ).toMatchInlineSnapshot(`
        {
          "body": {
            "className": "bad-request",
            "code": 400,
            "data": {
              "errorCode": "VERIFICATION_TOKEN_EXPIRED",
            },
            "errors": {
              "$className": "verifyExpired",
            },
            "message": "Verification token has expired.",
            "name": "BadRequest",
          },
          "status": 400,
        }
      `)
    })
  })

  describe('sendResetPwd', () => {
    const sendResetPwd = (email: string) =>
      authManagement({ action: 'sendResetPwd', value: { email } })

    it('answers {} without an email for an unknown email', async () => {
      expect(await sendResetPwd('missing@example.com')).toEqual({
        status: 201,
        body: {}
      })
      expect(sentEmails).toEqual([])
    })

    it('answers {} without an email for an unverified account', async () => {
      const user = await createTestUser(server.db)
      expect(await sendResetPwd(user.email!)).toEqual({ status: 201, body: {} })
      expect(sentEmails).toEqual([])
    })

    it('answers {} and sends the reset email for a verified account', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      expect(await sendResetPwd(user.email!)).toEqual({ status: 201, body: {} })
      expect(sentEmails).toEqual([
        {
          template: 'reset_password_instructions',
          message: { to: user.email },
          locals: expect.objectContaining({
            user: expect.objectContaining({
              id: user.id,
              resetToken: expect.any(String)
            })
          })
        }
      ])
    })
  })

  describe('resetPwdLong', () => {
    it('resets the password with the emailed token', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      await authManagement({
        action: 'sendResetPwd',
        value: { email: user.email }
      })
      const token = sentEmails[0].locals.user.resetToken

      const { status, body } = await authManagement({
        action: 'resetPwdLong',
        value: { token, password: 'new-password' }
      })
      expect({ status, body: scrub(body, user) }).toMatchInlineSnapshot(`
        {
          "body": {
            "active": true,
            "adminEmailNotifications": true,
            "baseurl": null,
            "bounceName": null,
            "bounceType": null,
            "createdAt": "<recent>",
            "email": "<email>",
            "id": "<id>",
            "isVerified": true,
            "lastLogin": null,
            "locale": "de-DE",
            "name": "Guest",
            "origin": null,
            "phone": "1234",
            "reminderSentAt": null,
            "resetAttempts": null,
            "secondReminderSentAt": null,
            "state": "RECENT_LOGIN",
            "updatedAt": "<recent>",
          },
          "status": 201,
        }
      `)
      expect((await signIn(user.email!, 'new-password')).status).toBe(201)
    })

    it('rejects a wrong token', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      await authManagement({
        action: 'sendResetPwd',
        value: { email: user.email }
      })
      expect(
        await authManagement({
          action: 'resetPwdLong',
          value: { token: `${user.id}___wrong`, password: 'new-password' }
        })
      ).toMatchInlineSnapshot(`
        {
          "body": {
            "className": "bad-request",
            "code": 400,
            "data": {
              "errorCode": "RESET_TOKEN_INVALID",
            },
            "errors": {
              "$className": "invalidToken",
            },
            "message": "Invalid token. Get for a new one. (authLocalMgnt)",
            "name": "BadRequest",
          },
          "status": 400,
        }
      `)
    })

    it('rejects a malformed token', async () => {
      expect(
        await authManagement({
          action: 'resetPwdLong',
          value: { token: 'invalid', password: 'new-password' }
        })
      ).toMatchInlineSnapshot(`
        {
          "body": {
            "className": "bad-request",
            "code": 400,
            "data": {},
            "errors": {
              "$className": "badParams",
            },
            "message": "Token is not in the correct format.",
            "name": "BadRequest",
          },
          "status": 400,
        }
      `)
    })
  })

  describe('passwordChange', () => {
    const passwordChange = (user: User, oldPassword: string) => ({
      action: 'passwordChange',
      value: {
        user: { email: user.email },
        oldPassword,
        password: 'new-password'
      }
    })

    it('changes the password of the signed-in user', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      const api = await signedIn(user)
      const { status, body } = await api(
        'POST',
        'authManagement',
        passwordChange(user, 'guest')
      )
      expect({ status, body: scrub(body, user) }).toMatchInlineSnapshot(`
        {
          "body": {
            "active": true,
            "adminEmailNotifications": true,
            "baseurl": null,
            "bounceName": null,
            "bounceType": null,
            "createdAt": "<recent>",
            "email": "<email>",
            "id": "<id>",
            "isVerified": true,
            "lastLogin": "<recent>",
            "locale": "de-DE",
            "name": "Guest",
            "origin": null,
            "phone": "1234",
            "reminderSentAt": null,
            "resetAttempts": null,
            "secondReminderSentAt": null,
            "state": "RECENT_LOGIN",
            "updatedAt": "<recent>",
          },
          "status": 201,
        }
      `)
      expect((await signIn(user.email!, 'new-password')).status).toBe(201)
    })

    it('rejects a wrong current password', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      const api = await signedIn(user)
      expect(await api('POST', 'authManagement', passwordChange(user, 'wrong')))
        .toMatchInlineSnapshot(`
        {
          "body": {
            "className": "bad-request",
            "code": 400,
            "data": {
              "errorCode": "CURRENT_PASSWORD_INCORRECT",
            },
            "errors": {
              "oldPassword": "Current password is incorrect.",
            },
            "message": "Current password is incorrect.",
            "name": "BadRequest",
          },
          "status": 400,
        }
      `)
    })

    it('rejects a guest', async () => {
      const user = await createTestUser(server.db, { isVerified: true })
      expect(await authManagement(passwordChange(user, 'guest')))
        .toMatchInlineSnapshot(`
        {
          "body": {
            "className": "not-authenticated",
            "code": 401,
            "message": "Not authenticated",
            "name": "NotAuthenticated",
          },
          "status": 401,
        }
      `)
      expect((await signIn(user.email!, 'guest')).status).toBe(201)
    })
  })

  // Last, so it sees the responses of every test above.
  it('exposes no account secrets in any response', () => {
    expect(server.responses.length).toBeGreaterThan(40)
    expect(secretsIn(server.responses)).toEqual([])
  })
})
