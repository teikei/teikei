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
  BADGE_COLUMNS,
  BADGE_SUMMARY,
  DEPOT_COLUMNS,
  ENTRY_COLUMNS,
  FARM_COLUMNS,
  NESTED_DEPOT_COLUMNS,
  PRODUCT_COLUMNS,
  PUBLIC_ENTRY_COLUMNS,
  qualify,
  withNameSearch,
  type AdminFilters
} from './entries.ts'
import {
  byEntry,
  forEntries,
  replaceRelation,
  toId,
  type RelationIds
} from './relations.ts'
import {
  ADMIN_OWNER_COLUMNS,
  OWNER_COLUMNS,
  type OwnerColumn
} from './users.ts'

export type FarmRow = Selectable<Farms>
export type FarmValues = Insertable<Farms>
export type FarmChanges = Updateable<Farms>

export type FarmRelations = {
  products?: RelationIds
  badges?: RelationIds
  depots?: RelationIds
  ownerships?: RelationIds
}

type Row = { id: string }

// The public endpoints accept no filters: production sends none (see above).
const PUBLIC_QUERYABLE: (keyof Farms)[] = []

export const createFarmsRepository = (db: Database) => {
  const findActive = <C extends keyof Farms>(
    query: Query,
    columns: readonly C[],
    trx: Database
  ) =>
    findMatching(
      trx.selectFrom('farms').select(columns).where('active', '=', true),
      query,
      PUBLIC_QUERYABLE
    )

  const findById = (id: string, activeOnly: boolean, trx: Database) =>
    trx
      .selectFrom('farms')
      .selectAll()
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst()

  const findOwnedBy = (userId: string, activeOnly: boolean, trx: Database) =>
    trx
      .selectFrom('farms')
      .innerJoin('farmsUsers', 'farmsUsers.farmId', 'farms.id')
      .select(qualify('farms', ENTRY_COLUMNS))
      .where('farmsUsers.userId', '=', userId)
      .$if(activeOnly, (qb) => qb.where('farms.active', '=', true))
      .orderBy('farms.id')
      .execute()

  const findProducts = (farmIds: readonly string[], trx: Database) =>
    forEntries(farmIds, (ids) =>
      trx
        .selectFrom('farmsProducts')
        .innerJoin('products', 'products.id', 'farmsProducts.productId')
        .select('farmsProducts.farmId as entryId')
        .select(qualify('products', PRODUCT_COLUMNS))
        .where('farmsProducts.farmId', 'in', ids)
        .orderBy('products.id')
        .execute()
    )

  const findBadges = <C extends keyof Badges>(
    farmIds: readonly string[],
    columns: readonly C[],
    trx: Database
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
    )

  const findDepots = <C extends keyof Depots>(
    farmIds: readonly string[],
    columns: readonly C[],
    trx: Database
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
    )

  const findOwners = <C extends OwnerColumn>(
    farmIds: readonly string[],
    columns: readonly C[],
    trx: Database
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

  // Summaries, and the farms nested in a depot, carry their products.
  const withProducts = async <R extends Row>(rows: R[], trx: Database) => {
    const products = byEntry(await findProducts(rows.map(toId), trx))
    return rows.map((row) => ({ ...row, products: products(row.id) }))
  }

  // The public detail shape: depots, products and badge summaries.
  const withDetails = async <R extends Row>(rows: R[], trx: Database) => {
    const ids = rows.map(toId)
    const depots = byEntry(await findDepots(ids, NESTED_DEPOT_COLUMNS, trx))
    const products = byEntry(await findProducts(ids, trx))
    const badges = byEntry(await findBadges(ids, BADGE_SUMMARY, trx))
    return rows.map((row) => ({
      ...row,
      depots: depots(row.id),
      products: products(row.id),
      badges: badges(row.id)
    }))
  }

  // Relation ids for react-admin, or full records for the API partner's
  // $details; the ids come from id-only queries, as the partner reads every
  // farm at once.
  const withAdminRelations = async (
    rows: FarmRow[],
    details: boolean,
    trx: Database
  ) => {
    const ids = rows.map(toId)
    const products = details
      ? byEntry(await findProducts(ids, trx))
      : byEntry(await findProducts(ids, trx), toId)
    const ownerships = details
      ? byEntry(await findOwners(ids, ADMIN_OWNER_COLUMNS, trx))
      : byEntry(await findOwners(ids, ['id'], trx), toId)
    const badges = details
      ? byEntry(await findBadges(ids, BADGE_COLUMNS, trx))
      : byEntry(await findBadges(ids, ['id'], trx), toId)
    const depots = details
      ? byEntry(await findDepots(ids, DEPOT_COLUMNS, trx))
      : byEntry(await findDepots(ids, ['id'], trx), toId)
    return rows.map((row) => ({
      ...row,
      products: products(row.id),
      ownerships: ownerships(row.id),
      badges: badges(row.id),
      depots: depots(row.id)
    }))
  }

  return {
    withProducts: <R extends Row>(rows: R[], trx: Database = db) =>
      withProducts(rows, trx),

    findSummaries: async (query: Query, trx: Database = db) =>
      withProducts(await findActive(query, ENTRY_COLUMNS, trx), trx),

    findDetails: async (query: Query, trx: Database = db) =>
      withDetails(await findActive(query, FARM_COLUMNS, trx), trx),

    findDetailsById: async (id: string, trx: Database = db) => {
      const row = await findById(id, true, trx)
      return row && (await withDetails([row], trx))[0]
    },

    // For the entries map, without the owner-only address columns.
    findMapEntries: async (trx: Database = db) =>
      withProducts(await findActive({}, PUBLIC_ENTRY_COLUMNS, trx), trx),

    findOwnedMapEntries: async (userId: string, trx: Database = db) =>
      withProducts(await findOwnedBy(userId, true, trx), trx),

    findAllOwned: (userId: string, trx: Database = db) =>
      findOwnedBy(userId, false, trx),

    findAdminPage: async (
      query: Query,
      { withBadge, withoutBadge, inOrigins }: AdminFilters,
      { details }: { details: boolean },
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
      const page = await findPage(select, withNameSearch(query), FARM_COLUMNS)
      return {
        ...page,
        data: await withAdminRelations(page.data, details, trx)
      }
    },

    findAdminById: async (
      id: string,
      { details }: { details: boolean },
      trx: Database = db
    ) => {
      const row = await findById(id, false, trx)
      return row && (await withAdminRelations([row], details, trx))[0]
    },

    // For entry contact messages: the active farm and whom to send them to.
    findWithOwners: async (id: string, trx: Database = db) => {
      const row = await findById(id, true, trx)
      if (!row) {
        return undefined
      }
      const owners = byEntry(await findOwners([row.id], OWNER_COLUMNS, trx))
      return { ...row, ownerships: owners(row.id) }
    },

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

    insert: (values: FarmValues, trx: Database = db) =>
      trx
        .insertInto('farms')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow(),

    update: (id: string, values: FarmChanges, trx: Database = db) =>
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

    // Replaces the relations present in `relations` and leaves the others. A
    // write answers with the full records of the relations it was given, like
    // the relate hooks did, so they are returned as the admin details show
    // them.
    saveRelations: async (
      id: string,
      { products, badges, depots, ownerships }: FarmRelations,
      trx: Database = db
    ) => {
      if (products) {
        await replaceRelation(
          trx,
          'farmsProducts',
          'farmId',
          id,
          'productId',
          products
        )
      }
      if (badges) {
        await replaceRelation(
          trx,
          'farmsBadges',
          'farmId',
          id,
          'badgeId',
          badges
        )
      }
      if (depots) {
        await replaceRelation(
          trx,
          'farmsDepots',
          'farmId',
          id,
          'depotId',
          depots
        )
      }
      if (ownerships) {
        await replaceRelation(
          trx,
          'farmsUsers',
          'farmId',
          id,
          'userId',
          ownerships
        )
      }
      return {
        ...(products && {
          products: byEntry(await findProducts([id], trx))(id)
        }),
        ...(badges && {
          badges: byEntry(await findBadges([id], BADGE_COLUMNS, trx))(id)
        }),
        ...(depots && {
          depots: byEntry(await findDepots([id], DEPOT_COLUMNS, trx))(id)
        }),
        ...(ownerships && {
          ownerships: byEntry(await findOwners([id], ADMIN_OWNER_COLUMNS, trx))(
            id
          )
        })
      }
    }
  }
}
