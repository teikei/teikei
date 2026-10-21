import { SUPERADMIN, USER, stable, startTestServer } from './testServer.ts'

// Characterises the merged entry listings: the public map listing, the
// signed-in user's own entries and the admin's per-user entries. Seeded: farm
// 1 (products 1 and 3), depot 1 and initiative 1 (goals 1 and 2), all owned by
// the superadmin (user 1).
describe('entry list services', () => {
  let server: Awaited<ReturnType<typeof startTestServer>>

  beforeAll(async () => {
    server = await startTestServer()
    const { db } = server
    // An inactive farm of the superadmin and an active depot of user 4.
    await db
      .insertInto('farms')
      .values({
        name: 'Inaktiv',
        city: 'Berlin',
        latitude: 52.5,
        longitude: 13.4,
        active: false
      })
      .execute()
    await db.insertInto('farmsUsers').values({ farmId: 2, userId: 1 }).execute()
    await db
      .insertInto('depots')
      .values({
        name: 'Nutzer-Depot',
        address: 'Hauptstraße 1',
        city: 'Leipzig',
        latitude: 51.3,
        longitude: 12.4
      })
      .execute()
    await db
      .insertInto('depotsUsers')
      .values({ depotId: 2, userId: 4 })
      .execute()
  })

  afterAll(() => server.close())

  it('lists every active entry without private fields', async () => {
    expect(stable(await server.guest('GET', 'entries'))).toMatchSnapshot()
  })

  it('ignores $details on the public listing', async () => {
    expect(stable(await server.guest('GET', 'entries?$details=true'))).toEqual(
      stable(await server.guest('GET', 'entries'))
    )
  })

  it("lists the signed-in user's own active entries", async () => {
    const owner = await server.login(SUPERADMIN)

    expect(stable(await owner('GET', 'entries?mine=true'))).toMatchSnapshot()
  })

  it.each(['farm', 'depot', 'initiative'])(
    "lists one of the signed-in user's entries by id and type %s",
    async (type) => {
      const owner = await server.login(SUPERADMIN)

      expect(
        stable(await owner('GET', `entries?mine=true&type=${type}&id=1`))
      ).toMatchSnapshot()
    }
  )

  it("does not list another user's entry by id and type", async () => {
    const user = await server.login(USER)

    expect(
      stable(await user('GET', 'entries?mine=true&type=farm&id=1'))
    ).toMatchSnapshot()
  })

  it('lists no own entries for a guest', async () => {
    expect(await server.guest('GET', 'entries?mine=true')).toMatchSnapshot()
  })

  it("lists a user's entries for the admin", async () => {
    const admin = await server.login(SUPERADMIN)

    const entries = await admin(
      'GET',
      'admin/entries?userId=1&$limit=25&$skip=0&$sort[id]=-1'
    )
    expect(stable(entries)).toMatchSnapshot()
    expect(await admin('GET', 'admin/users/1/entries')).toEqual(entries)
  })
})
