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
  BADGE_COLUMNS,
  BADGE_SUMMARY,
  ENTRY_COLUMNS,
  INITIATIVE_COLUMNS,
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

export type InitiativeRow = Selectable<Initiatives>
export type InitiativeValues = Insertable<Initiatives>
export type InitiativeChanges = Updateable<Initiatives>

export type InitiativeRelations = {
  goals?: RelationIds
  badges?: RelationIds
  ownerships?: RelationIds
}

type Row = { id: string }

// The public endpoints accept no filters: production sends none (see above).
const PUBLIC_QUERYABLE: (keyof Initiatives)[] = []

export const createInitiativesRepository = (db: Database) => {
  const findActive = <C extends keyof Initiatives>(
    query: Query,
    columns: readonly C[],
    trx: Database
  ) =>
    findMatching(
      trx.selectFrom('initiatives').select(columns).where('active', '=', true),
      query,
      PUBLIC_QUERYABLE
    )

  const findById = (id: string, activeOnly: boolean, trx: Database) =>
    trx
      .selectFrom('initiatives')
      .selectAll()
      .where('id', '=', id)
      .$if(activeOnly, (qb) => qb.where('active', '=', true))
      .executeTakeFirst()

  const findOwnedBy = (userId: string, activeOnly: boolean, trx: Database) =>
    trx
      .selectFrom('initiatives')
      .innerJoin(
        'initiativesUsers',
        'initiativesUsers.initiativeId',
        'initiatives.id'
      )
      .select(qualify('initiatives', ENTRY_COLUMNS))
      .where('initiativesUsers.userId', '=', userId)
      .$if(activeOnly, (qb) => qb.where('initiatives.active', '=', true))
      .orderBy('initiatives.id')
      .execute()

  const findGoals = (initiativeIds: readonly string[], trx: Database) =>
    forEntries(initiativeIds, (ids) =>
      trx
        .selectFrom('initiativesGoals')
        .innerJoin('goals', 'goals.id', 'initiativesGoals.goalId')
        .select('initiativesGoals.initiativeId as entryId')
        .select(['goals.id', 'goals.name'])
        .where('initiativesGoals.initiativeId', 'in', ids)
        .orderBy('goals.id')
        .execute()
    )

  const findBadges = <C extends keyof Badges>(
    initiativeIds: readonly string[],
    columns: readonly C[],
    trx: Database
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
    )

  const findOwners = <C extends OwnerColumn>(
    initiativeIds: readonly string[],
    columns: readonly C[],
    trx: Database
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

  // The entries map and the owner's entries carry the goals.
  const withGoals = async <R extends Row>(rows: R[], trx: Database) => {
    const goals = byEntry(await findGoals(rows.map(toId), trx))
    return rows.map((row) => ({ ...row, goals: goals(row.id) }))
  }

  // The public detail shape: goals and badge summaries.
  const withDetails = async <R extends Row>(rows: R[], trx: Database) => {
    const ids = rows.map(toId)
    const goals = byEntry(await findGoals(ids, trx))
    const badges = byEntry(await findBadges(ids, BADGE_SUMMARY, trx))
    return rows.map((row) => ({
      ...row,
      goals: goals(row.id),
      badges: badges(row.id)
    }))
  }

  // Relation ids for react-admin, or full records for the API partner's
  // $details.
  const withAdminRelations = async (
    rows: InitiativeRow[],
    details: boolean,
    trx: Database
  ) => {
    const ids = rows.map(toId)
    const goals = details
      ? byEntry(await findGoals(ids, trx))
      : byEntry(await findGoals(ids, trx), toId)
    const ownerships = details
      ? byEntry(await findOwners(ids, ADMIN_OWNER_COLUMNS, trx))
      : byEntry(await findOwners(ids, ['id'], trx), toId)
    const badges = details
      ? byEntry(await findBadges(ids, BADGE_COLUMNS, trx))
      : byEntry(await findBadges(ids, ['id'], trx), toId)
    return rows.map((row) => ({
      ...row,
      goals: goals(row.id),
      ownerships: ownerships(row.id),
      badges: badges(row.id)
    }))
  }

  return {
    findSummaries: (query: Query, trx: Database = db) =>
      findActive(query, ENTRY_COLUMNS, trx),

    findDetails: async (query: Query, trx: Database = db) =>
      withDetails(await findActive(query, INITIATIVE_COLUMNS, trx), trx),

    findDetailsById: async (id: string, trx: Database = db) => {
      const row = await findById(id, true, trx)
      return row && (await withDetails([row], trx))[0]
    },

    // For the entries map, without the owner-only address columns.
    findMapEntries: async (trx: Database = db) =>
      withGoals(await findActive({}, PUBLIC_ENTRY_COLUMNS, trx), trx),

    findOwnedMapEntries: async (userId: string, trx: Database = db) =>
      withGoals(await findOwnedBy(userId, true, trx), trx),

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

    // For entry contact messages: the active initiative and whom to send them
    // to.
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

    insert: (values: InitiativeValues, trx: Database = db) =>
      trx
        .insertInto('initiatives')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow(),

    update: (id: string, values: InitiativeChanges, trx: Database = db) =>
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

    // Replaces the relations present in `relations` and leaves the others. A
    // write answers with the full records of the relations it was given, like
    // the relate hooks did, so they are returned as the admin details show
    // them.
    saveRelations: async (
      id: string,
      { goals, badges, ownerships }: InitiativeRelations,
      trx: Database = db
    ) => {
      if (goals) {
        await replaceRelation(
          trx,
          'initiativesGoals',
          'initiativeId',
          id,
          'goalId',
          goals
        )
      }
      if (badges) {
        await replaceRelation(
          trx,
          'initiativesBadges',
          'initiativeId',
          id,
          'badgeId',
          badges
        )
      }
      if (ownerships) {
        await replaceRelation(
          trx,
          'initiativesUsers',
          'initiativeId',
          id,
          'userId',
          ownerships
        )
      }
      return {
        ...(goals && { goals: byEntry(await findGoals([id], trx))(id) }),
        ...(badges && {
          badges: byEntry(await findBadges([id], BADGE_COLUMNS, trx))(id)
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
