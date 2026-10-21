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
  ENTRY_COLUMNS,
  FARM_COLUMNS,
  PUBLIC_ENTRY_COLUMNS,
  qualify,
  withNameSearch,
  type AdminFilters
} from './entries.ts'
import { createFarmsRepository } from './farms.ts'
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

export type DepotRow = Selectable<Depots>
export type DepotValues = Insertable<Depots>
export type DepotChanges = Updateable<Depots>

export type DepotRelations = {
  farms?: RelationIds
  ownerships?: RelationIds
}

type Row = { id: string }

// The public endpoints accept no filters: production sends none (see above).
const PUBLIC_QUERYABLE: (keyof Depots)[] = []

export const createDepotsRepository = (db: Database) => {
  const farmsRepository = createFarmsRepository(db)

  const findActive = <C extends keyof Depots>(
    query: Query,
    columns: readonly C[],
    trx: Database
  ) =>
    findMatching(
      trx.selectFrom('depots').select(columns).where('active', '=', true),
      query,
      PUBLIC_QUERYABLE
    )

  const findById = (id: string, activeOnly: boolean, trx: Database) =>
    trx
      .selectFrom('depots')
      .selectAll()
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst()

  const findOwnedBy = (userId: string, activeOnly: boolean, trx: Database) =>
    trx
      .selectFrom('depots')
      .innerJoin('depotsUsers', 'depotsUsers.depotId', 'depots.id')
      .select(qualify('depots', ENTRY_COLUMNS))
      .where('depotsUsers.userId', '=', userId)
      .$if(activeOnly, (qb) => qb.where('depots.active', '=', true))
      .orderBy('depots.id')
      .execute()

  const findFarms = <C extends keyof Farms>(
    depotIds: readonly string[],
    columns: readonly C[],
    trx: Database
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
    )

  const findOwners = <C extends OwnerColumn>(
    depotIds: readonly string[],
    columns: readonly C[],
    trx: Database
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

  // The public detail shape: the depot's farms, each with its products.
  const withDetails = async <R extends Row>(rows: R[], trx: Database) => {
    const depotFarms = await findFarms(rows.map(toId), ENTRY_COLUMNS, trx)
    const farms = byEntry(await farmsRepository.withProducts(depotFarms, trx))
    return rows.map((row) => ({ ...row, farms: farms(row.id) }))
  }

  // Relation ids for react-admin, or full records for $details.
  const withAdminRelations = async (
    rows: DepotRow[],
    details: boolean,
    trx: Database
  ) => {
    const ids = rows.map(toId)
    const ownerships = details
      ? byEntry(await findOwners(ids, ADMIN_OWNER_COLUMNS, trx))
      : byEntry(await findOwners(ids, ['id'], trx), toId)
    const farms = details
      ? byEntry(await findFarms(ids, FARM_COLUMNS, trx))
      : byEntry(await findFarms(ids, ['id'], trx), toId)
    return rows.map((row) => ({
      ...row,
      ownerships: ownerships(row.id),
      farms: farms(row.id)
    }))
  }

  return {
    findSummaries: (query: Query, trx: Database = db) =>
      findActive(query, ENTRY_COLUMNS, trx),

    findDetails: async (query: Query, trx: Database = db) =>
      withDetails(await findActive(query, DEPOT_COLUMNS, trx), trx),

    findDetailsById: async (id: string, trx: Database = db) => {
      const row = await findById(id, true, trx)
      return row && (await withDetails([row], trx))[0]
    },

    // For the entries map, without the owner-only address columns.
    findMapEntries: (trx: Database = db) =>
      findActive({}, PUBLIC_ENTRY_COLUMNS, trx),

    findOwnedMapEntries: (userId: string, trx: Database = db) =>
      findOwnedBy(userId, true, trx),

    findAllOwned: (userId: string, trx: Database = db) =>
      findOwnedBy(userId, false, trx),

    findAdminPage: async (
      query: Query,
      { inOrigins }: AdminFilters,
      { details }: { details: boolean },
      trx: Database = db
    ) => {
      const page = await findPage(
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
      )
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

    // For entry contact messages: the active depot and whom to send them to.
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

    insert: (values: DepotValues, trx: Database = db) =>
      trx
        .insertInto('depots')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow(),

    update: (id: string, values: DepotChanges, trx: Database = db) =>
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

    // Replaces the relations present in `relations` and leaves the others.
    saveRelations: async (
      id: string,
      { farms, ownerships }: DepotRelations,
      trx: Database = db
    ) => {
      if (farms) {
        await replaceRelation(
          trx,
          'farmsDepots',
          'depotId',
          id,
          'farmId',
          farms
        )
      }
      if (ownerships) {
        await replaceRelation(
          trx,
          'depotsUsers',
          'depotId',
          id,
          'userId',
          ownerships
        )
      }
    }
  }
}
