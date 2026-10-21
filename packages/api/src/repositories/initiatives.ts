// Query strings sent to the initiative endpoints, from the production access
// logs (2026-10-06 to 2026-10-20) and the admin's ra-data-feathers calls.
//
// initiatives (public)
//   find   (no parameters)                    embed, legacy map, crawlers
//          $details=true                      accepted like farms; not seen
//          $select, $eager                    never sent by a client; rejected
//   get    (no parameters)                    embed, legacy map, ZeroWasteMap
//                                             WordPress plugin, apps
//   create, patch, remove                     embed and legacy map entry forms
//
// admin/initiatives
//   find   $details=true&$limit=10000         API partner (TYPO3 job), every 6 h
//          $limit=25&$skip=0&$sort[<field>]=1 | -1
//            + any List filter as <field>=<value>:
//              id, name, address, postalcode, city, state, country, url,
//              description, active
//            + badges.id=<id> (InitiativesFilterSidebar)
//            name is matched as name $ilike '%<value>%'
//          No ReferenceArrayInput points at admin/initiatives.
//   get    (no parameters)                    InitiativesEdit
//   patch  changed fields only (ra-data-feathers objectDiff)
//   remove                                    DeleteButton
//   create is not offered by the admin UI.
import type { Query } from '@feathersjs/feathers'
import { sql, type Insertable, type Selectable, type Updateable } from 'kysely'
import { findMatching, findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Badges, Initiatives } from '../db/types.ts'
import {
  INITIATIVE_COLUMNS,
  qualify,
  withNameSearch,
  type AdminFilters
} from './entries.ts'
import { forEntries } from './relations.ts'
import type { OwnerColumn } from './users.ts'

export type InitiativeRow = Selectable<Initiatives>

// The public endpoints accept no filters: production sends none (see above).
const PUBLIC_QUERYABLE: (keyof Initiatives)[] = []

export const createInitiativesRepository = (db: Database) => ({
  findActive: (
    query: Query,
    columns: readonly (keyof Initiatives)[],
    trx: Database = db
  ) =>
    findMatching(
      trx.selectFrom('initiatives').select(columns).where('active', '=', true),
      query,
      PUBLIC_QUERYABLE
    ),

  findPage: (query: Query, { inOrigins }: AdminFilters, trx: Database = db) =>
    findPage(
      trx
        .selectFrom('initiatives')
        .selectAll()
        .$if(inOrigins !== undefined, (qb) =>
          qb.where(({ exists, selectFrom }) =>
            inOrigins?.length
              ? exists(
                  selectFrom('initiativesOrigins')
                    .whereRef(
                      'initiativesOrigins.initiativeId',
                      '=',
                      'initiatives.id'
                    )
                    .where('initiativesOrigins.origin', 'in', inOrigins)
                )
              : sql<boolean>`false`
          )
        ),
      withNameSearch(query),
      INITIATIVE_COLUMNS
    ),

  findById: (
    id: string,
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) =>
    trx
      .selectFrom('initiatives')
      .selectAll()
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst(),

  findOwnedBy: (
    userId: string,
    columns: readonly (keyof Initiatives)[],
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) =>
    trx
      .selectFrom('initiatives')
      .innerJoin(
        'initiativesUsers',
        'initiativesUsers.initiativeId',
        'initiatives.id'
      )
      .select(qualify('initiatives', columns))
      .where('initiativesUsers.userId', '=', userId)
      .$if(activeOnly, (qb) => qb.where('initiatives.active', '=', true))
      .orderBy('initiatives.id')
      .execute(),

  findForAuthorization: async (
    id: string,
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) => {
    const initiative = await trx
      .selectFrom('initiatives')
      .select(['id', 'active'])
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst()
    if (!initiative) {
      return undefined
    }
    const ownerships = await trx
      .selectFrom('initiativesUsers')
      .select('userId as id')
      .where('initiativeId', '=', id)
      .orderBy('initiativesUsers.id')
      .execute()
    return { ...initiative, ownerships }
  },

  isInAdminOrigins: async (id: string, userId: string, trx: Database = db) =>
    (await trx
      .selectFrom('initiativesOrigins')
      .select('origin')
      .where('initiativeId', '=', id)
      .where('origin', 'in', (eb) =>
        eb
          .selectFrom('adminsOrigins')
          .innerJoin('origins', 'origins.id', 'adminsOrigins.originId')
          .select('origins.origin')
          .where('adminsOrigins.userId', '=', userId)
      )
      .executeTakeFirst()) !== undefined,

  insert: (values: Insertable<Initiatives>, trx: Database = db) =>
    trx
      .insertInto('initiatives')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: Updateable<Initiatives>, trx: Database = db) =>
    trx
      .updateTable('initiatives')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  delete: (id: string, trx: Database = db) =>
    trx
      .deleteFrom('initiatives')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  findGoals: (initiativeIds: readonly string[], trx: Database = db) =>
    forEntries(initiativeIds, (ids) =>
      trx
        .selectFrom('initiativesGoals')
        .innerJoin('goals', 'goals.id', 'initiativesGoals.goalId')
        .select('initiativesGoals.initiativeId as entryId')
        .select(['goals.id', 'goals.name'])
        .where('initiativesGoals.initiativeId', 'in', ids)
        .orderBy('goals.id')
        .execute()
    ),

  findBadges: <C extends keyof Badges>(
    initiativeIds: readonly string[],
    columns: readonly C[],
    trx: Database = db
  ) =>
    forEntries(initiativeIds, (ids) =>
      trx
        .selectFrom('initiativesBadges')
        .innerJoin('badges', 'badges.id', 'initiativesBadges.badgeId')
        .select('initiativesBadges.initiativeId as entryId')
        .select(qualify('badges', columns))
        .where('initiativesBadges.initiativeId', 'in', ids)
        .orderBy('badges.id')
        .execute()
    ),

  findOwners: <C extends OwnerColumn>(
    initiativeIds: readonly string[],
    columns: readonly C[],
    trx: Database = db
  ) =>
    forEntries(initiativeIds, (ids) =>
      trx
        .selectFrom('initiativesUsers')
        .innerJoin('users', 'users.id', 'initiativesUsers.userId')
        .select('initiativesUsers.initiativeId as entryId')
        .select(qualify('users', columns))
        .where('initiativesUsers.initiativeId', 'in', ids)
        .orderBy('users.id')
        .execute()
    )
})
