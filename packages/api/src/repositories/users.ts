// Query strings sent to the user endpoints, from the admin's ra-data-feathers
// calls and the auth libraries (see src/services/users.ts).
//
// admin/users
//   find   $limit=25&$skip=0&$sort[<field>]=1 | -1
//            + any List filter as <field>=<value>:
//              id, name, email, phone, isVerified, adminEmailNotifications,
//              origin, state
//              name and email are matched as $ilike '%<value>%'
//            + roles.id=<id> (UserFilterSidebar)
//            + $details=true for role and origin records instead of ids
//          q=<text>&$limit&$skip&$sort[id]     ReferenceArrayInput choices
//                                             (entry form ownerships);
//                                             q is matched against email, and
//                                             name, if given, exactly
//          id[$in][]=<id>...&$limit=<n>        getMany (entry form ownerships)
//   get    (no parameters) | $details=true    UsersEdit
//   patch  changed fields only, with roles and adminOrigins as id lists
//   remove                                    DeleteButton
//   create is not offered by the admin UI.
import type { Query } from '@feathersjs/feathers'
import { sql, type Insertable, type Selectable, type Updateable } from 'kysely'
import { findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Users } from '../db/types.ts'
import { qualify } from './entries.ts'
import {
  byEntry,
  forEntries,
  replaceRelation,
  toId,
  type RelationIds
} from './relations.ts'

export type UserRow = Selectable<Users>
export type UserValues = Insertable<Users>
export type UserChanges = Updateable<Users>

export type UserRelations = {
  roles?: RelationIds
  adminOrigins?: RelationIds
}

// Named admin list filters: users with a role, and the users an admin may
// see, which are those of their origins and themselves.
export type AdminUserFilters = {
  withRole?: string
  visibleTo?: { origins: string[]; userId: string }
}

// Every user column a query reads comes from these lists, so no query can
// return a password or a token by accident.

// Owners on public entry reads, contact messages and admin notifications.
export const OWNER_COLUMNS = [
  'id',
  'email',
  'name',
  'origin',
  'baseurl',
  'locale'
] as const satisfies readonly (keyof Users)[]

// Owners in admin $details responses, and the record a user write answers
// with: what the User model serialised, minus reactivationToken, which it let
// through.
export const ADMIN_OWNER_COLUMNS = [
  'id',
  'email',
  'name',
  'phone',
  'origin',
  'baseurl',
  'locale',
  'isVerified',
  'createdAt',
  'updatedAt',
  'lastLogin',
  'adminEmailNotifications',
  'resetAttempts',
  'state',
  'active',
  'reminderSentAt',
  'secondReminderSentAt',
  'bounceType',
  'bounceName'
] as const satisfies readonly (keyof Users)[]

export type OwnerColumn = (typeof ADMIN_OWNER_COLUMNS)[number]

// The admin/users records.
const ADMIN_USER_COLUMNS = [
  'id',
  'email',
  'name',
  'origin',
  'baseurl',
  'phone',
  'isVerified',
  'createdAt',
  'updatedAt',
  'lastLogin',
  'adminEmailNotifications',
  'resetAttempts',
  'state',
  'active'
] as const satisfies readonly (keyof Users)[]

// Every column, secrets included. Only the reads the authentication stack
// makes use it, and sign-up, whose confirmation email needs the token.
const CREDENTIAL_COLUMNS = [
  ...ADMIN_OWNER_COLUMNS,
  'password',
  'reactivationToken',
  'verifyToken',
  'verifyShortToken',
  'verifyExpires',
  'verifyChanges',
  'resetToken',
  'resetShortToken',
  'resetExpires'
] as const satisfies readonly (keyof Users)[]

const ROLE_COLUMNS = ['id', 'name'] as const

const ORIGIN_COLUMNS = [
  'id',
  'origin',
  'baseurl',
  'originName',
  'organizationName',
  'organizationEmail'
] as const

// The admin list sends q (reference inputs) for a case-insensitive substring
// match on the email, or name and email (list filters) for one on each.
export const withUserSearch = ({ q, ...query }: Query): Query => {
  if (q !== undefined) {
    return { ...query, email: { $ilike: `%${q}%` } }
  }
  const { name, email } = query
  return {
    ...query,
    ...(name !== undefined && { name: { $ilike: `%${name}%` } }),
    ...(email !== undefined && { email: { $ilike: `%${email}%` } })
  }
}

type Row = { id: string }

export const createUsersRepository = (db: Database) => {
  const findRoles = <C extends (typeof ROLE_COLUMNS)[number]>(
    userIds: readonly string[],
    columns: readonly C[],
    trx: Database
  ) =>
    forEntries(userIds, (ids) =>
      trx
        .selectFrom('usersRoles')
        .innerJoin('roles', 'roles.id', 'usersRoles.roleId')
        .select('usersRoles.userId as entryId')
        .select(qualify('roles', columns))
        .where('usersRoles.userId', 'in', ids)
        .orderBy('roles.id')
        .execute()
    )

  const findAdminOrigins = <C extends (typeof ORIGIN_COLUMNS)[number]>(
    userIds: readonly string[],
    columns: readonly C[],
    trx: Database
  ) =>
    forEntries(userIds, (ids) =>
      trx
        .selectFrom('adminsOrigins')
        .innerJoin('origins', 'origins.id', 'adminsOrigins.originId')
        .select('adminsOrigins.userId as entryId')
        .select(qualify('origins', columns))
        .where('adminsOrigins.userId', 'in', ids)
        .orderBy('origins.id')
        .execute()
    )

  const withRelationRecords = async <R extends Row>(
    rows: R[],
    trx: Database
  ) => {
    const ids = rows.map(toId)
    const roles = byEntry(await findRoles(ids, ROLE_COLUMNS, trx))
    const adminOrigins = byEntry(
      await findAdminOrigins(ids, ORIGIN_COLUMNS, trx)
    )
    return rows.map((row) => ({
      ...row,
      roles: roles(row.id),
      adminOrigins: adminOrigins(row.id)
    }))
  }

  // Relation ids for react-admin, or full records with $details.
  const withAdminRelations = async <R extends Row>(
    rows: R[],
    details: boolean,
    trx: Database
  ) => {
    const ids = rows.map(toId)
    const roles = details
      ? byEntry(await findRoles(ids, ROLE_COLUMNS, trx))
      : byEntry(await findRoles(ids, ['id'], trx), toId)
    const adminOrigins = details
      ? byEntry(await findAdminOrigins(ids, ORIGIN_COLUMNS, trx))
      : byEntry(await findAdminOrigins(ids, ['id'], trx), toId)
    return rows.map((row) => ({
      ...row,
      roles: roles(row.id),
      adminOrigins: adminOrigins(row.id)
    }))
  }

  const findAccounts = (
    column: 'email' | 'verifyToken',
    value: string,
    limit: number | undefined,
    trx: Database
  ) =>
    trx
      .selectFrom('users')
      .select(CREDENTIAL_COLUMNS)
      .where(column, '=', value)
      .orderBy('id')
      .$if(limit !== undefined, (qb) => qb.limit(limit!))
      .execute()

  return {
    // The record the authentication stack works with: every column, and the
    // roles and admin origins, which go into the token and params.user.
    findAccountById: async (id: string, trx: Database = db) => {
      const row = await trx
        .selectFrom('users')
        .select(CREDENTIAL_COLUMNS)
        .where('id', '=', id)
        .executeTakeFirst()
      return row && (await withRelationRecords([row], trx))[0]
    },

    findAccountsByEmail: (email: string, limit?: number, trx: Database = db) =>
      findAccounts('email', email, limit, trx),

    findAccountsByVerifyToken: (
      token: string,
      limit?: number,
      trx: Database = db
    ) => findAccounts('verifyToken', token, limit, trx),

    // For the audit email job.
    findByEmails: (
      emails: readonly string[],
      limit?: number,
      trx: Database = db
    ) =>
      emails.length === 0
        ? Promise.resolve([])
        : trx
            .selectFrom('users')
            .select(OWNER_COLUMNS)
            .where('email', 'in', emails)
            .orderBy('id')
            .$if(limit !== undefined, (qb) => qb.limit(limit!))
            .execute(),

    findAdminPage: async (
      query: Query,
      { withRole, visibleTo }: AdminUserFilters,
      { details }: { details: boolean },
      trx: Database = db
    ) => {
      const select = trx
        .selectFrom('users')
        .select(ADMIN_USER_COLUMNS)
        .$if(withRole !== undefined, (qb) =>
          qb.where(({ exists, selectFrom }) =>
            exists(
              selectFrom('usersRoles')
                .whereRef('usersRoles.userId', '=', 'users.id')
                .where('usersRoles.roleId', '=', withRole!)
            )
          )
        )
        .$if(visibleTo !== undefined, (qb) =>
          qb.where((eb) =>
            eb.or([
              visibleTo!.origins.length > 0
                ? eb('users.origin', 'in', visibleTo!.origins)
                : sql<boolean>`false`,
              eb('users.id', '=', visibleTo!.userId)
            ])
          )
        )
      const page = await findPage(
        select,
        withUserSearch(query),
        ADMIN_USER_COLUMNS
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
      const row = await trx
        .selectFrom('users')
        .select(ADMIN_USER_COLUMNS)
        .where('id', '=', id)
        .executeTakeFirst()
      return row && (await withAdminRelations([row], details, trx))[0]
    },

    // Users with a recorded email bounce, from the given origins.
    findBounced: (origins: readonly string[], trx: Database = db) =>
      origins.length === 0
        ? Promise.resolve([])
        : trx
            .selectFrom('users')
            .select(['id', 'email', 'name', 'bounceType', 'bounceName'])
            .where((eb) =>
              eb.or([
                eb('bounceType', 'is not', null),
                eb('bounceName', 'is not', null)
              ])
            )
            .where('origin', 'in', origins)
            .orderBy('id')
            .execute(),

    findReactivation: (id: string, trx: Database = db) =>
      trx
        .selectFrom('users')
        .select(['id', 'state', 'reactivationToken'])
        .where('id', '=', id)
        .executeTakeFirst(),

    // Sign-up answers with every column: the confirmation email needs the
    // verification token, and the users hooks strip the secrets from the
    // response.
    insertAccount: (values: UserValues, trx: Database = db) =>
      trx
        .insertInto('users')
        .values(values)
        .returning(CREDENTIAL_COLUMNS)
        .executeTakeFirstOrThrow(),

    insert: (values: UserValues, trx: Database = db) =>
      trx
        .insertInto('users')
        .values(values)
        .returning(ADMIN_OWNER_COLUMNS)
        .executeTakeFirstOrThrow(),

    update: (id: string, changes: UserChanges, trx: Database = db) =>
      trx
        .updateTable('users')
        .set(changes)
        .where('id', '=', id)
        .returning(ADMIN_OWNER_COLUMNS)
        .executeTakeFirst(),

    delete: (id: string, trx: Database = db) =>
      trx
        .deleteFrom('users')
        .where('id', '=', id)
        .returning(ADMIN_OWNER_COLUMNS)
        .executeTakeFirst(),

    // Replaces the relations present in `relations` and leaves the others,
    // and answers with the full records of the relations given.
    saveRelations: async (
      id: string,
      { roles, adminOrigins }: UserRelations,
      trx: Database = db
    ) => {
      if (roles) {
        await replaceRelation(trx, 'usersRoles', 'userId', id, 'roleId', roles)
      }
      if (adminOrigins) {
        await replaceRelation(
          trx,
          'adminsOrigins',
          'userId',
          id,
          'originId',
          adminOrigins
        )
      }
      return {
        ...(roles && {
          roles: byEntry(await findRoles([id], ROLE_COLUMNS, trx))(id)
        }),
        ...(adminOrigins && {
          adminOrigins: byEntry(
            await findAdminOrigins([id], ORIGIN_COLUMNS, trx)
          )(id)
        })
      }
    },

    // Sets the active flag of the user's farms, initiatives and their farms'
    // depots. Depots the user owns without a farm keep theirs.
    setEntriesActive: async (
      userId: string,
      active: boolean,
      trx: Database = db
    ) => {
      await trx
        .updateTable('farms')
        .set({ active })
        .where('id', 'in', (eb) =>
          eb
            .selectFrom('farmsUsers')
            .select('farmId')
            .where('userId', '=', userId)
        )
        .execute()
      await trx
        .updateTable('initiatives')
        .set({ active })
        .where('id', 'in', (eb) =>
          eb
            .selectFrom('initiativesUsers')
            .select('initiativeId')
            .where('userId', '=', userId)
        )
        .execute()
      await trx
        .updateTable('depots')
        .set({ active })
        .where('id', 'in', (eb) =>
          eb
            .selectFrom('farmsUsers')
            .innerJoin('farmsDepots', 'farmsDepots.farmId', 'farmsUsers.farmId')
            .select('farmsDepots.depotId')
            .where('farmsUsers.userId', '=', userId)
        )
        .execute()
    },

    // Returns the id of the user with that email, if there is one.
    recordBounce: async (
      email: string,
      changes: Pick<UserChanges, 'bounceType' | 'bounceName' | 'updatedAt'>,
      trx: Database = db
    ) =>
      (
        await trx
          .updateTable('users')
          .set(changes)
          .where('email', '=', email)
          .returning('id')
          .executeTakeFirst()
      )?.id,

    // Admins who asked for notifications about new entries from this origin.
    findAdminsToNotify: (origin: string | null, trx: Database = db) =>
      trx
        .selectFrom('users')
        .select(OWNER_COLUMNS)
        .where('adminEmailNotifications', '=', true)
        .where(({ exists, selectFrom }) =>
          exists(
            selectFrom('usersRoles')
              .innerJoin('roles', 'roles.id', 'usersRoles.roleId')
              .whereRef('usersRoles.userId', '=', 'users.id')
              .where('roles.name', '=', 'admin')
          )
        )
        .where(({ exists, selectFrom }) =>
          exists(
            selectFrom('adminsOrigins')
              .innerJoin('origins', 'origins.id', 'adminsOrigins.originId')
              .whereRef('adminsOrigins.userId', '=', 'users.id')
              .where('origins.origin', '=', origin)
          )
        )
        .orderBy('users.id')
        .execute()
  }
}
