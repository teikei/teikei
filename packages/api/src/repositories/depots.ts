// Query strings sent to the depot endpoints, from the production access logs
// (2026-10-06 to 2026-10-20) and the admin's ra-data-feathers calls.
//
// depots (public)
//   find   (no parameters)                    embed, legacy map, crawlers
//          $details=true                      accepted like farms; not seen
//          $select, $eager                    never sent by a client; rejected
//   get    (no parameters)                    embed, legacy map, ZeroWasteMap
//                                             WordPress plugin, apps
//   create, patch, remove                     embed and legacy map entry forms
//
// admin/depots
//   find   $details=true                      accepted like admin/farms; not seen
//          $limit=25&$skip=0&$sort[<field>]=1 | -1
//            + any List filter as <field>=<value>:
//              id, name, address, postalcode, city, state, country, url,
//              description, deliveryDays, active
//            name is matched as name $ilike '%<value>%'
//          q=<text>&$limit&$skip&$sort[id]     ReferenceArrayInput choices
//                                             (FarmForm depots)
//          id[$in][]=<id>...&$limit=<n>        getMany (FarmForm depots)
//   get    (no parameters)                    DepotsEdit
//   patch  changed fields only (ra-data-feathers objectDiff)
//   remove                                    DeleteButton
//   create is not offered by the admin UI.
import type { Query } from '@feathersjs/feathers'
import { sql, type Insertable, type Selectable, type Updateable } from 'kysely'
import { findMatching, findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Depots, Farms } from '../db/types.ts'
import {
  DEPOT_COLUMNS,
  qualify,
  withNameSearch,
  type AdminFilters
} from './entries.ts'
import { forEntries } from './relations.ts'
import type { OwnerColumn } from './users.ts'

export type DepotRow = Selectable<Depots>

// The public endpoints accept no filters: production sends none (see above).
const PUBLIC_QUERYABLE: (keyof Depots)[] = []

export const createDepotsRepository = (db: Database) => ({
  findActive: (
    query: Query,
    columns: readonly (keyof Depots)[],
    trx: Database = db
  ) =>
    findMatching(
      trx.selectFrom('depots').select(columns).where('active', '=', true),
      query,
      PUBLIC_QUERYABLE
    ),

  findPage: (query: Query, { inOrigins }: AdminFilters, trx: Database = db) =>
    findPage(
      trx
        .selectFrom('depots')
        .selectAll()
        .$if(inOrigins !== undefined, (qb) =>
          qb.where(({ exists, selectFrom }) =>
            inOrigins?.length
              ? exists(
                  selectFrom('depotsOrigins')
                    .whereRef('depotsOrigins.depotId', '=', 'depots.id')
                    .where('depotsOrigins.origin', 'in', inOrigins)
                )
              : sql<boolean>`false`
          )
        ),
      withNameSearch(query),
      DEPOT_COLUMNS
    ),

  findById: (
    id: string,
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) =>
    trx
      .selectFrom('depots')
      .selectAll()
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst(),

  findOwnedBy: (
    userId: string,
    columns: readonly (keyof Depots)[],
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) =>
    trx
      .selectFrom('depots')
      .innerJoin('depotsUsers', 'depotsUsers.depotId', 'depots.id')
      .select(qualify('depots', columns))
      .where('depotsUsers.userId', '=', userId)
      .$if(activeOnly, (qb) => qb.where('depots.active', '=', true))
      .orderBy('depots.id')
      .execute(),

  findForAuthorization: async (
    id: string,
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) => {
    const depot = await trx
      .selectFrom('depots')
      .select(['id', 'active'])
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst()
    if (!depot) {
      return undefined
    }
    const ownerships = await trx
      .selectFrom('depotsUsers')
      .select('userId as id')
      .where('depotId', '=', id)
      .orderBy('depotsUsers.id')
      .execute()
    return { ...depot, ownerships }
  },

  isInAdminOrigins: async (id: string, userId: string, trx: Database = db) =>
    (await trx
      .selectFrom('depotsOrigins')
      .select('origin')
      .where('depotId', '=', id)
      .where('origin', 'in', (eb) =>
        eb
          .selectFrom('adminsOrigins')
          .innerJoin('origins', 'origins.id', 'adminsOrigins.originId')
          .select('origins.origin')
          .where('adminsOrigins.userId', '=', userId)
      )
      .executeTakeFirst()) !== undefined,

  insert: (values: Insertable<Depots>, trx: Database = db) =>
    trx
      .insertInto('depots')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: Updateable<Depots>, trx: Database = db) =>
    trx
      .updateTable('depots')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  delete: (id: string, trx: Database = db) =>
    trx
      .deleteFrom('depots')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  findFarms: <C extends keyof Farms>(
    depotIds: readonly string[],
    columns: readonly C[],
    trx: Database = db
  ) =>
    forEntries(depotIds, (ids) =>
      trx
        .selectFrom('farmsDepots')
        .innerJoin('farms', 'farms.id', 'farmsDepots.farmId')
        .select('farmsDepots.depotId as entryId')
        .select(qualify('farms', columns))
        .where('farmsDepots.depotId', 'in', ids)
        .orderBy('farms.id')
        .execute()
    ),

  findOwners: <C extends OwnerColumn>(
    depotIds: readonly string[],
    columns: readonly C[],
    trx: Database = db
  ) =>
    forEntries(depotIds, (ids) =>
      trx
        .selectFrom('depotsUsers')
        .innerJoin('users', 'users.id', 'depotsUsers.userId')
        .select('depotsUsers.depotId as entryId')
        .select(qualify('users', columns))
        .where('depotsUsers.depotId', 'in', ids)
        .orderBy('users.id')
        .execute()
    )
})
