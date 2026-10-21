import type { Database } from '../db/kysely.ts'
import type { Users } from '../db/types.ts'

// Every user column an entry query reads comes from these lists, so no query
// can return a password or a token by accident.

// Owners on public entry reads, contact messages and admin notifications.
export const OWNER_COLUMNS = [
  'id',
  'email',
  'name',
  'origin',
  'baseurl',
  'locale'
] as const satisfies readonly (keyof Users)[]

// Owners in admin $details responses: what the User model serialised, minus
// reactivationToken, which it let through.
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

export const createUsersRepository = (db: Database) => ({
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
})
