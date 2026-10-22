import { notFound, validate } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createInitiativesRepository,
  type InitiativeChanges,
  type InitiativeRelations,
  type InitiativeValues
} from '../repositories/initiatives.ts'
import { transaction } from '../repositories/transaction.ts'
import {
  adminFilters,
  withoutServerFields,
  type AdminUser
} from './entryRules.ts'
import { schemas } from './validation/index.js'

type InitiativeInput = InitiativeValues & InitiativeRelations

export type InitiativePatch = InitiativeChanges & InitiativeRelations

export const createInitiativesDomain = (db: Database) => {
  const initiatives = createInitiativesRepository(db)

  const create = (input: InitiativeInput, ownerId?: string) => {
    const { goals, badges, ownerships, ...columns } = withoutServerFields(input)
    return transaction(db, async (tx) => {
      const row = await initiatives.insert(
        { ...columns, createdAt: new Date() },
        tx
      )
      const relations = await initiatives.saveRelations(
        row.id,
        { goals, badges, ownerships },
        tx
      )
      if (ownerId) {
        await initiatives.saveRelations(row.id, { ownerships: [ownerId] }, tx)
      }
      return { ...row, ...relations }
    })
  }

  return {
    list: (query: ListQuery, { details }: { details: boolean }) =>
      details
        ? initiatives.findDetails(query)
        : initiatives.findSummaries(query),

    get: async (id: string) => {
      const initiative = await initiatives.findDetailsById(id)
      if (!initiative) {
        throw notFound(id)
      }
      return initiative
    },

    create: (input: unknown, ownerId?: string) =>
      create(validate<InitiativeInput>(schemas.initiative, input), ownerId),

    patch: (id: string, input: InitiativePatch) => {
      const { goals, badges, ownerships, ...columns } =
        withoutServerFields(input)
      return transaction(db, async (tx) => {
        const row = await initiatives.update(
          id,
          { ...columns, updatedAt: new Date() },
          tx
        )
        if (!row) {
          throw notFound(id)
        }
        return {
          ...row,
          ...(await initiatives.saveRelations(
            id,
            { goals, badges, ownerships },
            tx
          ))
        }
      })
    },

    remove: async (id: string) => {
      const row = await initiatives.delete(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    listAdmin: (
      query: ListQuery,
      { details, user }: { details: boolean; user?: AdminUser }
    ) => initiatives.findAdminPage(query, adminFilters(user), { details }),

    getAdmin: async (id: string, details: boolean) => {
      const initiative = await initiatives.findAdminById(id, { details })
      if (!initiative) {
        throw notFound(id)
      }
      return initiative
    },

    createAdmin: (input: unknown) =>
      create(validate<InitiativeInput>(schemas.initiativeAdmin, input)),

    getForAuthorization: async (id: string, activeOnly: boolean) => {
      const initiative = await initiatives.findForAuthorization(id, {
        activeOnly
      })
      if (!initiative) {
        throw notFound(id)
      }
      return initiative
    },

    // For entry contact messages: the active initiative and whom to send them to.
    getWithOwners: async (id: string) => {
      const initiative = await initiatives.findWithOwners(id)
      if (!initiative) {
        throw notFound(id)
      }
      return initiative
    },

    isInAdminOrigins: (id: string, userId: string) =>
      initiatives.isInAdminOrigins(id, userId)
  }
}
