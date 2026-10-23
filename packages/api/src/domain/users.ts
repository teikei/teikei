import { BadRequest } from '@feathersjs/errors'
import { notFound, validate } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import { createRolesRepository } from '../repositories/roles.ts'
import { transaction } from '../repositories/transaction.ts'
import {
  createUsersRepository,
  type UserChanges,
  type UserRelations,
  type UserValues
} from '../repositories/users.ts'
import type { AdminUser } from './entryRules.ts'
import { schemas } from './validation/index.ts'

type AdminUserInput = UserValues & UserRelations

export type AdminUserPatch = UserChanges & UserRelations

export type Suppression = { bounceType: string; bounceName: string }

export const createUsersDomain = (db: Database) => {
  const users = createUsersRepository(db)
  const roles = createRolesRepository(db)

  // Clears the reminder state the inactivity jobs set.
  const recordLogin = async (id: string) => {
    const now = new Date()
    const row = await users.update(id, {
      state: 'RECENT_LOGIN',
      lastLogin: now,
      reminderSentAt: null,
      secondReminderSentAt: null,
      reactivationToken: null,
      updatedAt: now
    })
    if (!row) {
      throw notFound(id)
    }
  }

  return {
    // The account reads of the authentication stack, secrets included.
    getAccount: async (id: string) => {
      const account = await users.findAccountById(id)
      if (!account) {
        throw notFound(id)
      }
      return account
    },

    findAccountsByEmail: (email: string, limit?: number) =>
      users.findAccountsByEmail(email, limit),

    findAccountsByVerifyToken: (token: string, limit?: number) =>
      users.findAccountsByVerifyToken(token, limit),

    findByEmails: (emails: string[], limit?: number) =>
      users.findByEmails(emails, limit),

    getCampaignRecipient: async (id: string) => {
      const user = await users.findCampaignRecipient(id)
      if (!user) {
        throw notFound(id)
      }
      return user
    },

    // An account exists only with the user role.
    signUp: (input: unknown) => {
      const values = validate<UserValues>(schemas.user, input)
      return transaction(db, async (tx) => {
        const row = await users.insertAccount(values, tx)
        const role = await roles.findByName('user', tx)
        await users.saveRelations(row.id, { roles: [role.id] }, tx)
        return row
      })
    },

    patch: async (id: string, changes: UserChanges) => {
      const row = await users.update(id, changes)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    remove: async (id: string) => {
      const row = await users.delete(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    // Admins see the users of their origins and themselves; superadmins and
    // internal callers (no user) see every user.
    listAdmin: (
      query: ListQuery,
      {
        details,
        user,
        withRole
      }: {
        details: boolean
        user?: AdminUser & { id: string }
        withRole?: string
      }
    ) =>
      users.findAdminPage(
        query,
        {
          withRole,
          visibleTo:
            !user || user.roles.some(({ name }) => name === 'superadmin')
              ? undefined
              : {
                  origins: user.adminOrigins.map(({ origin }) => origin),
                  userId: user.id
                }
        },
        { details }
      ),

    getAdmin: async (id: string, details: boolean) => {
      const user = await users.findAdminById(id, { details })
      if (!user) {
        throw notFound(id)
      }
      return user
    },

    createAdmin: (input: unknown) => {
      const { roles, adminOrigins, ...columns } = validate<AdminUserInput>(
        schemas.userAdmin,
        input
      )
      return transaction(db, async (tx) => {
        const row = await users.insert(
          { ...columns, createdAt: new Date() },
          tx
        )
        return {
          ...row,
          ...(await users.saveRelations(row.id, { roles, adminOrigins }, tx))
        }
      })
    },

    patchAdmin: (id: string, input: AdminUserPatch) => {
      const { roles, adminOrigins, ...columns } = input
      return transaction(db, async (tx) => {
        const row = await users.update(
          id,
          { ...columns, updatedAt: new Date() },
          tx
        )
        if (!row) {
          throw notFound(id)
        }
        return {
          ...row,
          ...(await users.saveRelations(id, { roles, adminOrigins }, tx))
        }
      })
    },

    // Sets the active flag of the user and of their entries.
    setActive: (id: string, active: boolean) =>
      transaction(db, async (tx) => {
        const row = await users.update(
          id,
          { active, updatedAt: new Date() },
          tx
        )
        if (!row) {
          throw notFound(id)
        }
        await users.setEntriesActive(id, active, tx)
      }),

    recordLogin,

    // For the link in the login reminder emails: 'active' if the user has
    // logged in since, 'reset' if the token reset their login state.
    reactivate: async (id: string, token: string) => {
      const user = await users.findReactivation(id)
      if (!user) {
        throw notFound(id)
      }
      if (user.state === 'RECENT_LOGIN') {
        return 'active'
      }
      if (user.reactivationToken !== token) {
        throw new BadRequest('Invalid reactivation token.')
      }
      await recordLogin(id)
      return 'reset'
    },

    // Returns the id of the user with that email, if there is one.
    recordBounce: (email: string, { bounceType, bounceName }: Suppression) =>
      users.recordBounce(email, {
        bounceType,
        bounceName,
        updatedAt: new Date()
      }),

    // Users who did not react to either login reminder.
    flagNoResponse: () => users.flagNoResponse(),

    // The bounced users of the admin's origins, whatever their role.
    listBounces: (user: AdminUser) =>
      users.findBounced(user.adminOrigins.map(({ origin }) => origin))
  }
}
