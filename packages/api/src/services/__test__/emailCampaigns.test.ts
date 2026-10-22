import { sql } from 'kysely'
import type { Database } from '../../db/kysely.ts'
import { SUPERADMIN, stable, startTestServer } from './testServer.ts'

type Server = Awaited<ReturnType<typeof startTestServer>>
type Login = Awaited<ReturnType<Server['login']>>

const campaign = (id: string, values: object) => ({
  id,
  createdAt: null,
  updatedAt: null,
  ...values,
  type: 'EmailCampaign',
  link: `/email-campaigns/${id}`
})

const message = (id: string, values: object) => ({
  id,
  status: 'QUEUED',
  sentAt: null,
  sentTo: null,
  ...values,
  type: 'EmailMessage',
  link: `/email-messages/${id}`
})

// The rows the tests start from; the database assigns the ids in this order.
const campaignRows = [
  {
    name: 'Spring Update',
    template: 'bio_certification_update',
    status: 'CREATED',
    createdAt: '2019-03-01T10:00:00.000Z'
  },
  {
    name: 'Login Reminders',
    template: 'login_reminder',
    status: 'SENT',
    createdAt: '2019-04-01T10:00:00.000Z',
    updatedAt: '2019-04-02T10:00:00.000Z'
  },
  {
    name: 'Autumn Update',
    template: 'bio_certification_update',
    status: 'SENT',
    createdAt: '2019-09-01T10:00:00.000Z'
  }
]

const messageRows = [
  {
    userId: '1',
    campaignId: '2',
    status: 'SENT',
    sentAt: '2019-04-02T10:01:00.000Z',
    sentTo: 'superadmin@example.com'
  },
  { userId: '4', campaignId: '2' },
  { userId: '4', campaignId: '3', status: 'UNSUBSCRIBED' }
]

const campaigns = campaignRows.map((row, i) => campaign(String(i + 1), row))
const messages = messageRows.map((row, i) => message(String(i + 1), row))

// Starts from the campaigns and messages above, as the seeds have none.
const seedCampaigns = async (db: Database) => {
  await sql`truncate email_campaigns, email_messages restart identity cascade`.execute(
    db
  )
  await db.insertInto('emailCampaigns').values(campaignRows).execute()
  await db.insertInto('emailMessages').values(messageRows).execute()
}

// Characterises admin/email-campaigns and admin/email-messages with the
// requests packages/admin sends (src/repositories/emailCampaigns.ts), signed in
// as superadmin.
describe('email campaign services', () => {
  let server: Server
  let superadmin: Login

  beforeAll(async () => {
    server = await startTestServer({
      features: { emailCampaigns: 'true', runJobsFromAdminUi: 'false' }
    })
    superadmin = await server.login(SUPERADMIN)
  })

  beforeEach(() => seedCampaigns(server.db))

  afterAll(() => server.close())

  describe('admin/email-campaigns', () => {
    it('lists a page like the campaigns list', async () => {
      expect(
        await superadmin(
          'GET',
          'admin/email-campaigns?$limit=25&$skip=0&$sort[id]=1'
        )
      ).toEqual({
        status: 200,
        body: { total: 3, limit: 25, skip: 0, data: campaigns }
      })
    })

    it('finds the first page with the default limit', async () => {
      expect(await superadmin('GET', 'admin/email-campaigns')).toEqual({
        status: 200,
        body: {
          total: 3,
          limit: 50,
          skip: 0,
          data: expect.arrayContaining(campaigns)
        }
      })
    })

    it('pages and sorts', async () => {
      expect(
        await superadmin(
          'GET',
          'admin/email-campaigns?$limit=1&$skip=1&$sort[name]=-1'
        )
      ).toEqual({
        status: 200,
        body: { total: 3, limit: 1, skip: 1, data: [campaigns[1]] }
      })
    })

    it.each([
      ['id[$in][]=3&id[$in][]=1&$limit=2', ['1', '3']],
      ['status=SENT', ['2', '3']],
      ['name[$ilike]=%25update%25', ['1', '3']]
    ])('filters %s', async (query, expected) => {
      const { body } = await superadmin(
        'GET',
        `admin/email-campaigns?${query}&$sort[id]=1`
      )
      expect(body.data.map(({ id }: { id: string }) => id)).toEqual(expected)
    })

    it('gets a campaign', async () => {
      expect(await superadmin('GET', 'admin/email-campaigns/2')).toEqual({
        status: 200,
        body: campaigns[1]
      })
    })

    it('answers 404 for a missing id', async () => {
      expect(
        (await superadmin('GET', 'admin/email-campaigns/999999')).status
      ).toBe(404)
    })

    it('does not offer create', async () => {
      expect(
        (
          await superadmin('POST', 'admin/email-campaigns', {
            name: 'Summer Update',
            template: 'login_reminder'
          })
        ).status
      ).toBe(405)
    })

    it('patches a campaign', async () => {
      const response = await superadmin('PATCH', 'admin/email-campaigns/1', {
        name: 'Early Spring Update'
      })
      expect(stable(response)).toEqual({
        status: 200,
        body: {
          ...campaigns[0],
          name: 'Early Spring Update',
          updatedAt: '<recent>'
        }
      })
    })

    it('patches a campaign with the fields of a record it read', async () => {
      const response = await superadmin('PATCH', 'admin/email-campaigns/2', {
        ...campaigns[1],
        name: 'Renamed'
      })
      expect(stable(response)).toEqual({
        status: 200,
        body: { ...campaigns[1], name: 'Renamed', updatedAt: '<recent>' }
      })
    })

    it('answers 404 when patching a missing campaign', async () => {
      expect(
        (
          await superadmin('PATCH', 'admin/email-campaigns/999999', {
            name: 'nothing'
          })
        ).status
      ).toBe(404)
    })

    it('removes a campaign without messages', async () => {
      expect(await superadmin('DELETE', 'admin/email-campaigns/1')).toEqual({
        status: 200,
        body: campaigns[0]
      })
      expect((await superadmin('GET', 'admin/email-campaigns/1')).status).toBe(
        404
      )
    })

    it('removes a campaign with its messages', async () => {
      expect(await superadmin('DELETE', 'admin/email-campaigns/2')).toEqual({
        status: 200,
        body: campaigns[1]
      })
      expect(
        (await superadmin('GET', 'admin/email-messages?campaignId=2')).body
          .total
      ).toBe(0)
    })

    it('does not offer update', async () => {
      expect(
        (
          await superadmin('PUT', 'admin/email-campaigns/1', {
            name: 'Replaced'
          })
        ).status
      ).toBe(405)
    })
  })

  // The broadcast campaigns are gone: sending a campaign only sets its status.
  it('queues nothing when a created bio certification update is sent', async () => {
    const response = await superadmin('PATCH', 'admin/email-campaigns/1', {
      status: 'SENT'
    })
    expect(stable(response)).toEqual({
      status: 200,
      body: { ...campaigns[0], status: 'SENT', updatedAt: '<recent>' }
    })
    expect(
      (await superadmin('GET', 'admin/email-messages?campaignId=1')).body.total
    ).toBe(0)
  })

  describe('admin/email-messages', () => {
    it('lists a page like the messages list', async () => {
      expect(
        await superadmin(
          'GET',
          'admin/email-messages?$limit=10&$skip=0&$sort[id]=1'
        )
      ).toEqual({
        status: 200,
        body: { total: 3, limit: 10, skip: 0, data: messages }
      })
    })

    it('pages and sorts', async () => {
      expect(
        await superadmin(
          'GET',
          'admin/email-messages?$limit=1&$skip=0&$sort[id]=-1'
        )
      ).toEqual({
        status: 200,
        body: { total: 3, limit: 1, skip: 0, data: [messages[2]] }
      })
    })

    it.each([
      ['id=2', ['2']],
      ['campaignId=2', ['1', '2']],
      ['status=QUEUED', ['2']],
      ['campaignId=2&status=SENT', ['1']],
      ['id[$in][]=3&id[$in][]=1&$limit=2', ['1', '3']],
      ['sentTo[$ilike]=SUPERADMIN%25', ['1']]
    ])('filters %s', async (query, expected) => {
      const { body } = await superadmin(
        'GET',
        `admin/email-messages?${query}&$sort[id]=1`
      )
      expect(body.data.map(({ id }: { id: string }) => id)).toEqual(expected)
    })

    it('gets a message', async () => {
      expect(await superadmin('GET', 'admin/email-messages/1')).toEqual({
        status: 200,
        body: messages[0]
      })
    })

    it('answers 404 for a missing id', async () => {
      expect(
        (await superadmin('GET', 'admin/email-messages/999999')).status
      ).toBe(404)
    })

    it('creates a test message', async () => {
      expect(
        await superadmin('POST', 'admin/email-messages', {
          userId: '2',
          campaignId: '1'
        })
      ).toEqual({
        status: 201,
        body: message('4', { userId: '2', campaignId: '1' })
      })
    })

    it('patches a message', async () => {
      expect(
        await superadmin('PATCH', 'admin/email-messages/2', {
          status: 'UNSUBSCRIBED'
        })
      ).toEqual({
        status: 200,
        body: { ...messages[1], status: 'UNSUBSCRIBED' }
      })
    })

    it('answers 404 when patching a missing message', async () => {
      expect(
        (
          await superadmin('PATCH', 'admin/email-messages/999999', {
            status: 'SENT'
          })
        ).status
      ).toBe(404)
    })

    it('removes a message', async () => {
      expect(await superadmin('DELETE', 'admin/email-messages/3')).toEqual({
        status: 200,
        body: messages[2]
      })
      expect((await superadmin('GET', 'admin/email-messages/3')).status).toBe(
        404
      )
    })

    it('does not offer update', async () => {
      expect(
        (
          await superadmin('PUT', 'admin/email-messages/1', {
            status: 'SENT'
          })
        ).status
      ).toBe(405)
    })
  })
})

describe('email campaign services with campaigns disabled', () => {
  let server: Server
  let superadmin: Login

  beforeAll(async () => {
    server = await startTestServer({
      features: { emailCampaigns: 'false', runJobsFromAdminUi: 'false' }
    })
    superadmin = await server.login(SUPERADMIN)
    await seedCampaigns(server.db)
  })

  afterAll(() => server.close())

  describe.each(['admin/email-campaigns', 'admin/email-messages'])(
    '%s',
    (path) => {
      it('still reads', async () => {
        expect((await superadmin('GET', `${path}/1`)).status).toBe(200)
      })

      it.each([
        ['POST', path],
        ['PATCH', `${path}/1`],
        ['DELETE', `${path}/1`]
      ])('answers 405 for %s', async (method, url) => {
        expect(
          await superadmin(method, url, method === 'DELETE' ? undefined : {})
        ).toMatchObject({ status: 405, body: { name: 'MethodNotAllowed' } })
      })
    }
  )
})
