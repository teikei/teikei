// Query strings sent to the farm endpoints, from the production access logs
// (2026-10-06 to 2026-10-20) and the admin's ra-data-feathers calls.
//
// farms (public)
//   find   (no parameters)                    embed, legacy map, crawlers
//          $details=true                      crawlers only
//          $select, $eager                    never sent by a client; rejected
//   get    (no parameters)                    embed, legacy map, ZeroWasteMap
//                                             WordPress plugin, apps
//   create, patch, remove                     embed and legacy map entry forms
//
// admin/farms
//   find   $details=true&$limit=10000         API partner (TYPO3 job), every 6 h
//          $limit=25&$skip=0&$sort[<field>]=1 | -1
//            + any List filter as <field>=<value>:
//              id, name, address, postalcode, city, state, country, url,
//              description, foundedAtMonth, foundedAtYear, maximumMembers,
//              additionalProductInformation, participation,
//              economicalBehavior, acceptsNewMembers, actsEcological, active
//            + hasBadge=<id> | notHasBadge=<id> (FarmsFilterSidebar)
//            name is matched as name $ilike '%<value>%'
//          q=<text>&$limit&$skip&$sort[id]     ReferenceArrayInput choices
//                                             (DepotForm farms)
//          id[$in][]=<id>...&$limit=<n>        getMany (DepotForm farms)
//   get    (no parameters)                    FarmsEdit
//   patch  changed fields only (ra-data-feathers objectDiff)
//   remove                                    DeleteButton
//   create is not offered by the admin UI.
import type { Query } from '@feathersjs/feathers'
import {
  sql,
  type ExpressionBuilder,
  type Insertable,
  type Selectable,
  type Updateable
} from 'kysely'
import { findMatching, findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Badges, DB, Depots, Farms } from '../db/types.ts'
import {
  FARM_COLUMNS,
  PRODUCT_COLUMNS,
  qualify,
  withNameSearch,
  type AdminFilters
} from './entries.ts'
import { forEntries } from './relations.ts'
import type { OwnerColumn } from './users.ts'

export type FarmRow = Selectable<Farms>

// The public endpoints accept no filters: production sends none (see above).
const PUBLIC_QUERYABLE: (keyof Farms)[] = []

export const createFarmsRepository = (db: Database) => ({
  findActive: (
    query: Query,
    columns: readonly (keyof Farms)[],
    trx: Database = db
  ) =>
    findMatching(
      trx.selectFrom('farms').select(columns).where('active', '=', true),
      query,
      PUBLIC_QUERYABLE
    ),

  findPage: (
    query: Query,
    { withBadge, withoutBadge, inOrigins }: AdminFilters,
    trx: Database = db
  ) => {
    const hasBadge = (eb: ExpressionBuilder<DB, 'farms'>, badgeId: string) =>
      eb.exists(
        eb
          .selectFrom('farmsBadges')
          .whereRef('farmsBadges.farmId', '=', 'farms.id')
          .where('farmsBadges.badgeId', '=', badgeId)
      )
    const select = trx
      .selectFrom('farms')
      .selectAll()
      .$if(inOrigins !== undefined, (qb) =>
        qb.where(({ exists, selectFrom }) =>
          inOrigins?.length
            ? exists(
                selectFrom('farmsOrigins')
                  .whereRef('farmsOrigins.farmId', '=', 'farms.id')
                  .where('farmsOrigins.origin', 'in', inOrigins)
              )
            : sql<boolean>`false`
        )
      )
      .$if(withBadge !== undefined, (qb) =>
        qb.where((eb) => hasBadge(eb, withBadge!))
      )
      .$if(withoutBadge !== undefined, (qb) =>
        qb.where((eb) => eb.not(hasBadge(eb, withoutBadge!)))
      )
    return findPage(select, withNameSearch(query), FARM_COLUMNS)
  },

  findById: (
    id: string,
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) =>
    trx
      .selectFrom('farms')
      .selectAll()
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst(),

  findOwnedBy: (
    userId: string,
    columns: readonly (keyof Farms)[],
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) =>
    trx
      .selectFrom('farms')
      .innerJoin('farmsUsers', 'farmsUsers.farmId', 'farms.id')
      .select(qualify('farms', columns))
      .where('farmsUsers.userId', '=', userId)
      .$if(activeOnly, (qb) => qb.where('farms.active', '=', true))
      .orderBy('farms.id')
      .execute(),

  findForAuthorization: async (
    id: string,
    { activeOnly }: { activeOnly: boolean },
    trx: Database = db
  ) => {
    const farm = await trx
      .selectFrom('farms')
      .select(['id', 'active'])
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst()
    if (!farm) {
      return undefined
    }
    const ownerships = await trx
      .selectFrom('farmsUsers')
      .select('userId as id')
      .where('farmId', '=', id)
      .orderBy('farmsUsers.id')
      .execute()
    return { ...farm, ownerships }
  },

  isInAdminOrigins: async (id: string, userId: string, trx: Database = db) =>
    (await trx
      .selectFrom('farmsOrigins')
      .select('origin')
      .where('farmId', '=', id)
      .where('origin', 'in', (eb) =>
        eb
          .selectFrom('adminsOrigins')
          .innerJoin('origins', 'origins.id', 'adminsOrigins.originId')
          .select('origins.origin')
          .where('adminsOrigins.userId', '=', userId)
      )
      .executeTakeFirst()) !== undefined,

  insert: (values: Insertable<Farms>, trx: Database = db) =>
    trx
      .insertInto('farms')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: Updateable<Farms>, trx: Database = db) =>
    trx
      .updateTable('farms')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  delete: (id: string, trx: Database = db) =>
    trx
      .deleteFrom('farms')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  findProducts: (farmIds: readonly string[], trx: Database = db) =>
    forEntries(farmIds, (ids) =>
      trx
        .selectFrom('farmsProducts')
        .innerJoin('products', 'products.id', 'farmsProducts.productId')
        .select('farmsProducts.farmId as entryId')
        .select(qualify('products', PRODUCT_COLUMNS))
        .where('farmsProducts.farmId', 'in', ids)
        .orderBy('products.id')
        .execute()
    ),

  findBadges: <C extends keyof Badges>(
    farmIds: readonly string[],
    columns: readonly C[],
    trx: Database = db
  ) =>
    forEntries(farmIds, (ids) =>
      trx
        .selectFrom('farmsBadges')
        .innerJoin('badges', 'badges.id', 'farmsBadges.badgeId')
        .select('farmsBadges.farmId as entryId')
        .select(qualify('badges', columns))
        .where('farmsBadges.farmId', 'in', ids)
        .orderBy('badges.id')
        .execute()
    ),

  findDepots: <C extends keyof Depots>(
    farmIds: readonly string[],
    columns: readonly C[],
    trx: Database = db
  ) =>
    forEntries(farmIds, (ids) =>
      trx
        .selectFrom('farmsDepots')
        .innerJoin('depots', 'depots.id', 'farmsDepots.depotId')
        .select('farmsDepots.farmId as entryId')
        .select(qualify('depots', columns))
        .where('farmsDepots.farmId', 'in', ids)
        .orderBy('depots.id')
        .execute()
    ),

  findOwners: <C extends OwnerColumn>(
    farmIds: readonly string[],
    columns: readonly C[],
    trx: Database = db
  ) =>
    forEntries(farmIds, (ids) =>
      trx
        .selectFrom('farmsUsers')
        .innerJoin('users', 'users.id', 'farmsUsers.userId')
        .select('farmsUsers.farmId as entryId')
        .select(qualify('users', columns))
        .where('farmsUsers.farmId', 'in', ids)
        .orderBy('users.id')
        .execute()
    )
})
