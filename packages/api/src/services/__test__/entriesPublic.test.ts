import { SUPERADMIN, USER, stable, startTestServer } from './testServer.ts'

// Characterises the public entry endpoints over HTTP, through the real
// authorization hook, so the move away from feathers-objection keeps the full
// response bodies. Seeded: farm 1 (products 1 and 3), depot 1 and initiative 1
// (goals 1 and 2), all owned by the superadmin.
const ENTRIES = {
  farms: {
    create: {
      name: 'Neue Farm',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731,
      acceptsNewMembers: 'waitlist',
      actsEcological: true,
      products: [2, 4],
      badges: [2],
      depots: [1]
    },
    patch: { name: 'Geänderte Farm', products: [5], badges: [], depots: [] }
  },
  depots: {
    create: {
      name: 'Neues Depot',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731,
      deliveryDays: 'Mittwoch',
      farms: [1]
    },
    patch: { name: 'Geändertes Depot', farms: [] }
  },
  initiatives: {
    create: {
      name: 'Neue Initiative',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731,
      goals: [3],
      badges: [1]
    },
    patch: { name: 'Geänderte Initiative', goals: [4], badges: [] }
  }
}

describe('public entry services', () => {
  let server: Awaited<ReturnType<typeof startTestServer>>

  beforeAll(async () => {
    server = await startTestServer()
    const { db } = server
    await db
      .insertInto('farmsDepots')
      .values({ farmId: 1, depotId: 1 })
      .execute()
    await db
      .insertInto('farmsBadges')
      .values({ farmId: 1, badgeId: 1 })
      .execute()
    await db
      .insertInto('initiativesBadges')
      .values({ initiativeId: 1, badgeId: 2 })
      .execute()
    // id 2 of each type, inactive
    for (const table of ['farms', 'depots', 'initiatives'] as const) {
      await db
        .insertInto(table)
        .values({
          name: 'Inaktiv',
          city: 'Berlin',
          latitude: 52.5,
          longitude: 13.4,
          active: false
        })
        .execute()
    }
  })

  afterAll(() => server.close())

  describe.each(Object.keys(ENTRIES))('%s reads', (path) => {
    it('finds the active entries in the summary shape', async () => {
      expect(stable(await server.guest('GET', path))).toMatchSnapshot()
    })

    it('finds the active entries in the detail shape', async () => {
      expect(
        stable(await server.guest('GET', `${path}?$details=true`))
      ).toMatchSnapshot()
    })

    it('accepts $eager and $select', async () => {
      expect(
        stable(await server.guest('GET', `${path}?$eager=[ownerships]`))
      ).toMatchSnapshot()
      expect(
        stable(await server.guest('GET', `${path}?$select[]=name`))
      ).toMatchSnapshot()
    })

    it('gets an entry as guest', async () => {
      expect(stable(await server.guest('GET', `${path}/1`))).toMatchSnapshot()
    })

    it('gets an entry with its private address as owner', async () => {
      const owner = await server.login(SUPERADMIN)

      expect(stable(await owner('GET', `${path}/1`))).toMatchSnapshot()
    })

    it('answers 404 for a missing and for an inactive entry', async () => {
      expect((await server.guest('GET', `${path}/999999`)).status).toBe(404)
      expect((await server.guest('GET', `${path}/2`)).status).toBe(404)
    })

    it('maps a database error raised while authorizing', async () => {
      const owner = await server.login(SUPERADMIN)

      const { status, body } = await owner('PATCH', `${path}/abc`, {
        name: 'x'
      })
      expect([status, body.name, body.message]).toEqual([
        400,
        'BadRequest',
        'Invalid Data'
      ])
    })

    it('answers 403 for a patch by a non-owner', async () => {
      const user = await server.login(USER)

      expect(await user('PATCH', `${path}/1`, { name: 'x' })).toMatchSnapshot()
    })

    it('answers 403 for a patch of a forbidden field', async () => {
      const owner = await server.login(SUPERADMIN)

      expect(
        await owner('PATCH', `${path}/1`, { active: false })
      ).toMatchSnapshot()
    })

    it('does not offer update', async () => {
      const owner = await server.login(SUPERADMIN)

      expect(
        (await owner('PUT', `${path}/1`, { name: 'x' })).status
      ).toMatchSnapshot()
    })
  })

  describe.each(Object.entries(ENTRIES))('%s writes', (path, data) => {
    it('creates, patches and removes an entry as its owner', async () => {
      const user = await server.login(USER)

      const created = await user('POST', path, data.create)
      expect(stable(created)).toMatchSnapshot()
      const url = `${path}/${created.body.properties.id}`
      expect(stable(await user('GET', url))).toMatchSnapshot()

      expect(stable(await user('PATCH', url, data.patch))).toMatchSnapshot()
      expect(stable(await user('GET', url))).toMatchSnapshot()

      expect(stable(await user('DELETE', url))).toMatchSnapshot()
      expect((await user('GET', url)).status).toBe(404)
    })

    it('ignores an id sent with a create', async () => {
      const user = await server.login(USER)

      const created = await user('POST', path, { ...data.create, id: 9000 })
      expect(stable(created)).toMatchSnapshot()

      await user('DELETE', `${path}/${created.body.properties.id}`)
    })

    it('writes nothing when a relation id is unknown', async () => {
      const user = await server.login(USER)
      const [relation] = Object.entries(data.create).find(([, value]) =>
        Array.isArray(value)
      )!
      const count = async () =>
        (
          await server.db
            .selectFrom(path as keyof typeof ENTRIES)
            .select('id')
            .execute()
        ).length
      const before = await count()

      const created = await user('POST', path, {
        ...data.create,
        [relation]: [999999]
      })

      expect(created.status).toBe(409)
      expect(await count()).toBe(before)
    })
  })
})
