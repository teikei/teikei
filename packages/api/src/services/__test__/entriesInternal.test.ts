import axios from 'axios'
import { USER, stable, startTestServer } from './testServer.ts'

// Characterises what the entry services hand to other services: the emails
// sent for contact messages and new entries, and the entry matches in the
// autocomplete. Seeded entries (id 1) are owned by the superadmin.
describe('entry side effects', () => {
  let server: Awaited<ReturnType<typeof startTestServer>>
  let sentEmails: unknown[]

  beforeAll(async () => {
    server = await startTestServer()
    // admin@example.com watches http://localhost:3000, admin2@example.com
    // http://localhost:4000; user@example.com signs up from the former.
    await server.db
      .insertInto('adminsOrigins')
      .values([
        { userId: 2, originId: 1 },
        { userId: 3, originId: 2 }
      ])
      .execute()
  })

  beforeEach(() => {
    sentEmails = []
    // The services keep using the data after the call, so record a copy.
    vi.spyOn(server.app.service('emails'), 'create').mockImplementation(
      async (data: unknown) => {
        sentEmails.push(stable(data))
        return data
      }
    )
  })

  afterAll(() => server.close())

  it.each(['farm', 'depot', 'initiative'])(
    'sends a %s contact message to every owner',
    async (type) => {
      const message = {
        id: 1,
        type,
        senderName: 'Interessierte',
        senderEmail: 'interessierte@example.com',
        text: 'Habt ihr noch Platz?'
      }

      expect(
        await server.guest('POST', 'entrycontactmessage', message)
      ).toEqual({ status: 201, body: message })
      expect(sentEmails).toMatchSnapshot()
    }
  )

  it('rejects a contact message for another service', async () => {
    const response = await server.guest('POST', 'entrycontactmessage', {
      id: 1,
      type: 'user',
      senderName: 'Interessierte',
      senderEmail: 'interessierte@example.com',
      text: 'Hallo'
    })

    expect(response.status).toBe(400)
    expect(sentEmails).toEqual([])
  })

  it('notifies the admins of the origin about a new entry', async () => {
    const user = await server.login(USER)

    const created = await user('POST', 'initiatives', {
      name: 'Neue Initiative',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731,
      goals: [1],
      badges: []
    })

    expect(created.status).toBe(201)
    expect(sentEmails).toMatchSnapshot()
  })

  it('adds the ranked entry matches to the autocomplete', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: {
        items: [
          {
            id: 'here:berlin',
            title: 'Berlin',
            position: { lat: 52.52, lng: 13.4 },
            administrativeAreaType: 'city',
            address: { label: 'Berlin, Deutschland', countryCode: 'DEU' }
          }
        ]
      }
    })
    await server.app.service('searchindex').create({})

    const { status, body } = await server.guest(
      'POST',
      'autocomplete?entries=true',
      { text: 'Beispiel' }
    )
    expect(status).toBe(201)
    // The seeded entries rank equally for 'Beispiel', and the search has no
    // tiebreaker, so their order among each other is arbitrary.
    expect(body.slice(0, 3)).toHaveLength(3)
    expect(body.slice(0, 3)).toEqual(
      expect.arrayContaining([
        { id: '1', title: 'Beispiel-Farm 1', type: 'farm' },
        { id: '1', title: 'Beispiel-Depot 1', type: 'depot' },
        { id: '1', title: 'Beispiel-Initiative 1', type: 'initiative' }
      ])
    )
    expect(body.slice(3)).toEqual([
      {
        id: 'here:berlin',
        title: 'Berlin, Deutschland',
        position: { lat: 52.52, lng: 13.4 },
        type: 'location',
        administrativeAreaType: 'city',
        countryCode: 'DEU'
      }
    ])
    expect(
      (
        await server.guest('POST', 'autocomplete?entries=true', {
          text: 'beispiel farm'
        })
      ).body
    ).toMatchSnapshot()
  })

  it('finds an entry once the search index is refreshed', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: { items: [] } })
    const user = await server.login(USER)
    const search = () =>
      server.guest('POST', 'autocomplete?entries=true', { text: 'suchbar' })

    await user('POST', 'depots', {
      name: 'Suchbares Depot',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731
    })
    await server.app.service('searchindex').create({})

    expect((await search()).body).toEqual([
      { id: expect.any(String), title: 'Suchbares Depot', type: 'depot' }
    ])
  })
})
