import { ADMIN, SUPERADMIN, stable, startTestServer } from './testServer.ts'

type Login = Awaited<
  ReturnType<Awaited<ReturnType<typeof startTestServer>>['login']>
>

// Characterises the admin entry endpoints with the query strings
// ra-data-feathers and the API partner send (src/repositories/{farms,depots,
// initiatives}.ts). Seeded entries (id 1) are owned by the superadmin, whose
// origin is http://localhost:3000; the entries inserted here (id 2) by admin2
// from http://localhost:4000.
const ENTRIES = {
  'admin/farms': {
    table: 'farms',
    create: {
      name: 'Admin-Farm',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731,
      acceptsNewMembers: 'no',
      actsEcological: false,
      products: [2],
      badges: [2],
      depots: [1],
      ownerships: [4]
    },
    patch: { products: [4, 5], badges: [], depots: [], ownerships: [1, 4] }
  },
  'admin/depots': {
    table: 'depots',
    create: {
      name: 'Admin-Depot',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731,
      farms: [1],
      ownerships: [4]
    },
    patch: { farms: [], ownerships: [1, 4] }
  },
  'admin/initiatives': {
    table: 'initiatives',
    create: {
      name: 'Admin-Initiative',
      city: 'Leipzig',
      latitude: 51.3397,
      longitude: 12.3731,
      goals: [3],
      badges: [1],
      ownerships: [4]
    },
    patch: { goals: [], badges: [2], ownerships: [1, 4] }
  }
} as const

const ids = ({ body }: { body: { data: { id: string }[] } }) =>
  body.data.map(({ id }) => id)

describe('admin entry services', () => {
  let server: Awaited<ReturnType<typeof startTestServer>>
  let superadmin: Login
  let admin: Login

  beforeAll(async () => {
    server = await startTestServer()
    const { db } = server
    await db
      .insertInto('adminsOrigins')
      .values([
        { userId: 1, originId: 1 },
        { userId: 2, originId: 1 }
      ])
      .execute()
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
      .values({ initiativeId: 1, badgeId: 1 })
      .execute()
    const entry = {
      name: 'Fremd',
      city: 'Hamburg',
      latitude: 53.55,
      longitude: 9.99,
      active: false
    }
    await db.insertInto('farms').values(entry).execute()
    await db.insertInto('farmsUsers').values({ farmId: 2, userId: 3 }).execute()
    await db.insertInto('depots').values(entry).execute()
    await db
      .insertInto('depotsUsers')
      .values({ depotId: 2, userId: 3 })
      .execute()
    await db.insertInto('initiatives').values(entry).execute()
    await db
      .insertInto('initiativesUsers')
      .values({ initiativeId: 2, userId: 3 })
      .execute()

    superadmin = await server.login(SUPERADMIN)
    admin = await server.login(ADMIN)
    // After the login, which clears it: shows which user columns admin
    // $details hands out.
    await db
      .updateTable('users')
      .set({ reactivationToken: 'reactivation-secret' })
      .where('id', '=', '1')
      .execute()
  })

  afterAll(() => server.close())

  describe.each(Object.keys(ENTRIES))('%s reads', (path) => {
    it('finds the first page with the default limit', async () => {
      expect(stable(await superadmin('GET', path))).toMatchSnapshot()
    })

    it('pages and sorts like a react-admin list', async () => {
      expect(
        stable(await superadmin('GET', `${path}?$limit=1&$skip=1&$sort[id]=-1`))
      ).toMatchSnapshot()
    })

    it('filters by name, q and columns', async () => {
      const list = '$limit=25&$skip=0&$sort[id]=1'
      expect(
        ids(await superadmin('GET', `${path}?${list}&name=BEISPIEL`))
      ).toEqual(['1'])
      expect(ids(await superadmin('GET', `${path}?${list}&q=fremd`))).toEqual([
        '2'
      ])
      expect(
        ids(await superadmin('GET', `${path}?${list}&city=Hamburg`))
      ).toEqual(['2'])
      expect(
        ids(await superadmin('GET', `${path}?${list}&active=true`))
      ).toEqual(['1'])
    })

    it('finds by ids like getMany', async () => {
      expect(
        stable(await superadmin('GET', `${path}?id[$in][0]=2&$limit=1`))
      ).toMatchSnapshot()
    })

    it('finds with full relations like the API partner', async () => {
      expect(
        stable(await superadmin('GET', `${path}?$details=true&$limit=10000`))
      ).toMatchSnapshot()
    })

    it('scopes an admin to their origins', async () => {
      expect(ids(await superadmin('GET', path))).toEqual(['1', '2'])
      expect(ids(await admin('GET', path))).toEqual(['1'])
    })

    it('gets an entry with relation ids', async () => {
      expect(stable(await superadmin('GET', `${path}/2`))).toMatchSnapshot()
    })

    it('gets an entry with full relations', async () => {
      expect(
        stable(await superadmin('GET', `${path}/1?$details=true`))
      ).toMatchSnapshot()
    })

    it('answers 404 for a missing entry', async () => {
      expect((await superadmin('GET', `${path}/999999`)).status).toBe(404)
    })
  })

  it('filters farms by badge within the admin origins', async () => {
    const list = '$limit=25&$skip=0&$sort[id]=1'
    expect(
      ids(await superadmin('GET', `admin/farms?${list}&hasBadge=1`))
    ).toEqual(['1'])
    expect(
      ids(await superadmin('GET', `admin/farms?${list}&notHasBadge=1`))
    ).toEqual([])
    expect(
      ids(await superadmin('GET', `admin/farms?${list}&notHasBadge=2`))
    ).toEqual(['1'])
    expect(ids(await admin('GET', `admin/farms?${list}&hasBadge=1`))).toEqual([
      '1'
    ])
  })

  it('filters initiatives by badges.id like the list sidebar', async () => {
    expect(
      stable(await superadmin('GET', 'admin/initiatives?badges.id=1'))
    ).toMatchSnapshot()
  })

  describe.each(Object.entries(ENTRIES))('%s writes', (path, data) => {
    let url: string

    it('fails a create under the origin condition', async () => {
      expect(await superadmin('POST', path, data.create)).toMatchSnapshot()
    })

    it('creates internally with every relation, ignoring the given id', async () => {
      const created = await server.app
        .service(path)
        .create({ ...data.create, id: 9000 })
      expect(created.id).not.toBe('9000')
      expect(stable(created)).toMatchSnapshot()
      url = `${path}/${created.id}`
      expect(stable(await superadmin('GET', url))).toMatchSnapshot()
    })

    it('patches every relation', async () => {
      expect(
        stable(await superadmin('PATCH', url, data.patch))
      ).toMatchSnapshot()
      expect(stable(await superadmin('GET', url))).toMatchSnapshot()
    })

    it('answers an empty patch with the unchanged entry', async () => {
      expect(stable(await superadmin('PATCH', url, {}))).toMatchSnapshot()
    })

    it('answers 403 for an entry outside the admin origins', async () => {
      expect((await admin('PATCH', `${path}/2`, { name: 'x' })).status).toBe(
        403
      )
      expect((await admin('DELETE', `${path}/2`)).status).toBe(403)
    })

    it('removes an entry', async () => {
      expect(stable(await superadmin('DELETE', url))).toMatchSnapshot()
      expect((await superadmin('GET', url)).status).toBe(404)
      const { db } = server
      expect(
        await db
          .selectFrom(data.table)
          .select('id')
          .where('id', '=', url.split('/').pop()!)
          .execute()
      ).toEqual([])
    })
  })
})
