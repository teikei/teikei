import type { Application } from '@feathersjs/feathers'
import { sql } from 'kysely'
import configureLoginReminders from '../../jobs/createLoginReminders.ts'
import configureSecondLoginReminders from '../../jobs/createSecondLoginReminders.ts'
import configureFlagInactiveUsers from '../../jobs/flagInactiveUsers.ts'
import configureSendMessages from '../../jobs/sendEmailCampaignMessages.ts'
import { logger } from '../../logger.ts'
import { emailsService, stable, startTestServer } from './testServer.ts'

type Server = Awaited<ReturnType<typeof startTestServer>>
type CampaignEmail = {
  template: string
  message: { messageStream: string; to: string }
  locals: { locale: string; user: Record<string, unknown> }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const weeksAgo = (weeks: number) =>
  new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000)

// Characterises the jobs that create, send and follow up on the login reminder
// campaigns.
describe('email campaign jobs', () => {
  let server: Server

  // The scheduler is off in tests, so the jobs register their callbacks here
  // and run them directly.
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

  // Users after the seeded ones (1 to 4, who never logged in), each in the
  // state a job looks at, with farms 1 and, for a farm owner of two farms,
  // 2 and 3.
  const insertUsers = async () => {
    const { db } = server
    await db
      .insertInto('farms')
      .values([{ name: 'Hof 2' }, { name: 'Hof 3' }])
      .execute()
    const users = await db
      .insertInto('users')
      .values([
        // 5: due for a reminder
        { email: 'due@example.com', isVerified: true, lastLogin: weeksAgo(60) },
        // 6: due for a reminder, owns two farms
        {
          email: 'two-farms@example.com',
          isVerified: true,
          lastLogin: weeksAgo(60)
        },
        // 7: logged in recently
        {
          email: 'recent@example.com',
          isVerified: true,
          lastLogin: weeksAgo(10)
        },
        // 8: not verified
        {
          email: 'unverified@example.com',
          isVerified: false,
          lastLogin: weeksAgo(60)
        },
        // 9: owns no farm
        {
          email: 'no-farm@example.com',
          isVerified: true,
          lastLogin: weeksAgo(60)
        },
        // 10: due for a second reminder
        {
          email: 'reminded@example.com',
          isVerified: true,
          state: 'REMINDER_SENT',
          reactivationToken: 'token-10',
          reminderSentAt: weeksAgo(8)
        },
        // 11: reminded recently
        {
          email: 'reminded-recently@example.com',
          isVerified: true,
          state: 'REMINDER_SENT',
          reactivationToken: 'token-11',
          reminderSentAt: weeksAgo(2)
        },
        // 12: due to be flagged, owns no farm
        {
          email: 'second-reminded@example.com',
          isVerified: false,
          state: 'SECOND_REMINDER_SENT',
          reactivationToken: 'token-12',
          reminderSentAt: weeksAgo(9)
        },
        // 13: reminded a second time recently
        {
          email: 'second-reminded-recently@example.com',
          isVerified: true,
          state: 'SECOND_REMINDER_SENT',
          reactivationToken: 'token-13',
          reminderSentAt: weeksAgo(7)
        }
      ])
      .returning('id')
      .execute()
    await db
      .insertInto('farmsUsers')
      .values([
        ...users
          .filter(({ id }) => id !== '9' && id !== '12')
          .map(({ id }) => ({ farmId: '1', userId: id })),
        { farmId: '2', userId: '6' },
        { farmId: '3', userId: '6' }
      ])
      .execute()
  }

  // Timestamps a job set are recent, the ones it left earlier.
  const when = (date: Date | null) =>
    date && (date > weeksAgo(1) ? '<recent>' : '<earlier>')

  const usersAfterSeeds = async () =>
    (
      await server.db
        .selectFrom('users')
        .select([
          'id',
          'state',
          'reactivationToken',
          'reminderSentAt',
          'secondReminderSentAt'
        ])
        .where('id', '>', '4')
        .orderBy('id')
        .execute()
    ).map((user) => ({
      ...user,
      reactivationToken: UUID.test(user.reactivationToken ?? '')
        ? '<uuid>'
        : user.reactivationToken,
      reminderSentAt: when(user.reminderSentAt),
      secondReminderSentAt: when(user.secondReminderSentAt)
    }))

  const campaigns = () =>
    server.db.selectFrom('emailCampaigns').selectAll().orderBy('id').execute()

  const messages = () =>
    server.db
      .selectFrom('emailMessages')
      .select(['userId', 'campaignId', 'status'])
      .orderBy('userId')
      .execute()

  beforeAll(async () => {
    server = await startTestServer()
  })

  beforeEach(async () => {
    await sql`truncate email_campaigns, email_messages restart identity cascade`.execute(
      server.db
    )
    await insertUsers()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await server.db.deleteFrom('users').where('id', '>', '4').execute()
    await server.db.deleteFrom('farms').where('id', '>', '1').execute()
    await sql`select setval('users_id_seq', 4), setval('farms_id_seq', 1)`.execute(
      server.db
    )
  })

  afterAll(() => server.close())

  const untouched = {
    5: { id: '5', state: 'RECENT_LOGIN', reactivationToken: null },
    6: { id: '6', state: 'RECENT_LOGIN', reactivationToken: null },
    7: { id: '7', state: 'RECENT_LOGIN', reactivationToken: null },
    8: { id: '8', state: 'RECENT_LOGIN', reactivationToken: null },
    9: { id: '9', state: 'RECENT_LOGIN', reactivationToken: null },
    10: {
      id: '10',
      state: 'REMINDER_SENT',
      reactivationToken: 'token-10',
      reminderSentAt: '<earlier>'
    },
    11: {
      id: '11',
      state: 'REMINDER_SENT',
      reactivationToken: 'token-11',
      reminderSentAt: '<earlier>'
    },
    12: {
      id: '12',
      state: 'SECOND_REMINDER_SENT',
      reactivationToken: 'token-12',
      reminderSentAt: '<earlier>'
    },
    13: {
      id: '13',
      state: 'SECOND_REMINDER_SENT',
      reactivationToken: 'token-13',
      reminderSentAt: '<earlier>'
    }
  }

  const users = (changed: Record<string, object>) =>
    Object.entries({ ...untouched, ...changed }).map(([, user]) => ({
      reminderSentAt: null,
      secondReminderSentAt: null,
      ...user
    }))

  it('sends the first login reminders to verified farm owners who have not logged in for a year', async () => {
    await jobCallback(configureLoginReminders)()

    expect(stable(await campaigns())).toEqual([
      {
        id: '1',
        name: expect.stringMatching(/^Login Reminders \d/),
        template: 'login_reminder',
        status: 'SENT',
        createdAt: '<recent>',
        updatedAt: null
      }
    ])
    expect(await usersAfterSeeds()).toEqual(
      users({
        5: {
          id: '5',
          state: 'REMINDER_SENT',
          reactivationToken: '<uuid>',
          reminderSentAt: '<recent>'
        },
        6: {
          id: '6',
          state: 'REMINDER_SENT',
          reactivationToken: '<uuid>',
          reminderSentAt: '<recent>'
        }
      })
    )
    expect(await messages()).toEqual([
      { userId: '5', campaignId: '1', status: 'QUEUED' },
      { userId: '6', campaignId: '1', status: 'QUEUED' }
    ])
  })

  it('leaves no campaign and no reminded user when the messages cannot be queued', async () => {
    await sql`alter table email_messages add constraint no_messages check (false) not valid`.execute(
      server.db
    )
    vi.spyOn(logger, 'error').mockImplementation(() => logger)
    try {
      await jobCallback(configureLoginReminders)()
    } finally {
      await sql`alter table email_messages drop constraint no_messages`.execute(
        server.db
      )
    }

    expect(logger.error).toHaveBeenCalled()
    expect(await campaigns()).toEqual([])
    expect(await usersAfterSeeds()).toEqual(users({}))
  })

  it('sends the second login reminders to verified farm owners reminded seven weeks ago', async () => {
    await jobCallback(configureSecondLoginReminders)()

    expect(stable(await campaigns())).toEqual([
      {
        id: '1',
        name: expect.stringMatching(/^Second Login Reminders \d/),
        template: 'second_login_reminder',
        status: 'SENT',
        createdAt: '<recent>',
        updatedAt: null
      }
    ])
    expect(await usersAfterSeeds()).toEqual(
      users({
        10: {
          id: '10',
          state: 'SECOND_REMINDER_SENT',
          reactivationToken: 'token-10',
          reminderSentAt: '<earlier>',
          secondReminderSentAt: '<recent>'
        }
      })
    )
    expect(await messages()).toEqual([
      { userId: '10', campaignId: '1', status: 'QUEUED' }
    ])
  })

  it('flags the users reminded eight weeks ago as not responding', async () => {
    await jobCallback(configureFlagInactiveUsers)()

    expect(await campaigns()).toEqual([])
    expect(await usersAfterSeeds()).toEqual(
      users({
        12: {
          id: '12',
          state: 'NO_RESPONSE',
          reactivationToken: null,
          reminderSentAt: '<earlier>'
        }
      })
    )
    expect(await messages()).toEqual([])
  })

  describe('sending', () => {
    beforeEach(async () => {
      const { db } = server
      await db
        .insertInto('emailCampaigns')
        .values({
          name: 'Reminders',
          template: 'login_reminder',
          status: 'SENT'
        })
        .execute()
      await db
        .insertInto('emailMessages')
        .values([
          { userId: '10', campaignId: '1' },
          { userId: '11', campaignId: '1' },
          { userId: '4', campaignId: '1', status: 'SENT' }
        ])
        .execute()
    })

    const sentMessages = () =>
      server.db
        .selectFrom('emailMessages')
        .select(['id', 'userId', 'status', 'sentTo', 'sentAt'])
        .orderBy('id')
        .execute()

    it('sends the queued messages and marks them as sent', async () => {
      const create = vi
        .spyOn(emailsService(server.app), 'create')
        .mockResolvedValue({})

      await jobCallback(configureSendMessages)()

      const emails = (create.mock.calls as unknown as [CampaignEmail][])
        .map(([data]) => data)
        .sort((a, b) => a.message.to.localeCompare(b.message.to))
      expect(emails).toEqual([
        {
          template: 'login_reminder',
          message: {
            messageStream: 'broadcast',
            to: 'reminded-recently@example.com'
          },
          locals: {
            locale: 'de-DE',
            user: {
              id: '11',
              email: 'reminded-recently@example.com',
              name: null,
              origin: null,
              baseurl: null,
              locale: 'de-DE',
              reactivationToken: 'token-11'
            }
          }
        },
        {
          template: 'login_reminder',
          message: { messageStream: 'broadcast', to: 'reminded@example.com' },
          locals: {
            locale: 'de-DE',
            user: {
              id: '10',
              email: 'reminded@example.com',
              name: null,
              origin: null,
              baseurl: null,
              locale: 'de-DE',
              reactivationToken: 'token-10'
            }
          }
        }
      ])
      expect(stable(await sentMessages())).toEqual([
        {
          id: '1',
          userId: '10',
          status: 'SENT',
          sentTo: 'reminded@example.com',
          sentAt: '<recent>'
        },
        {
          id: '2',
          userId: '11',
          status: 'SENT',
          sentTo: 'reminded-recently@example.com',
          sentAt: '<recent>'
        },
        { id: '3', userId: '4', status: 'SENT', sentTo: null, sentAt: null }
      ])
    })

    it('marks the messages to inactive recipients as unsubscribed', async () => {
      const inactive = Object.assign(new Error('InactiveRecipientsError'), {
        name: 'InactiveRecipientsError'
      })
      vi.spyOn(emailsService(server.app), 'create').mockImplementation(
        async ({ message }: CampaignEmail) => {
          if (message.to === 'reminded@example.com') {
            throw inactive
          }
          return {}
        }
      )

      await jobCallback(configureSendMessages)()

      expect(stable(await sentMessages())).toEqual([
        {
          id: '1',
          userId: '10',
          status: 'UNSUBSCRIBED',
          sentTo: null,
          sentAt: null
        },
        {
          id: '2',
          userId: '11',
          status: 'SENT',
          sentTo: 'reminded-recently@example.com',
          sentAt: '<recent>'
        },
        { id: '3', userId: '4', status: 'SENT', sentTo: null, sentAt: null }
      ])
    })
  })
})
