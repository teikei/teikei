import { notFound, validate } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createDepotsRepository,
  type DepotChanges,
  type DepotRelations,
  type DepotValues
} from '../repositories/depots.ts'
import { transaction } from '../repositories/transaction.ts'
import { adminFilters, type AdminUser } from './entryRules.ts'
import { schemas } from './validation/index.ts'

type DepotInput = DepotValues & DepotRelations

export type DepotPatch = DepotChanges & DepotRelations

export const createDepotsDomain = (db: Database) => {
  const depots = createDepotsRepository(db)

  const create = (input: DepotInput, ownerId?: string) => {
    const { farms, ownerships, ...columns } = input
    return transaction(db, async (tx) => {
      const row = await depots.insert({ ...columns, createdAt: new Date() }, tx)
      const relations = await depots.saveRelations(
        row.id,
        { farms, ownerships },
        tx
      )
      if (ownerId) {
        await depots.saveRelations(row.id, { ownerships: [ownerId] }, tx)
      }
      return { ...row, ...relations }
    })
  }

  return {
    list: (query: ListQuery, { details }: { details: boolean }) =>
      details ? depots.findDetails(query) : depots.findSummaries(query),

    get: async (id: string) => {
      const depot = await depots.findDetailsById(id)
      if (!depot) {
        throw notFound(id)
      }
      return depot
    },

    create: (input: unknown, ownerId?: string) =>
      create(validate<DepotInput>(schemas.depot, input), ownerId),

    patch: (id: string, input: DepotPatch) => {
      const { farms, ownerships, ...columns } = input
      return transaction(db, async (tx) => {
        const row = await depots.update(
          id,
          { ...columns, updatedAt: new Date() },
          tx
        )
        if (!row) {
          throw notFound(id)
        }
        return {
          ...row,
          ...(await depots.saveRelations(id, { farms, ownerships }, tx))
        }
      })
    },

    remove: async (id: string) => {
      const row = await depots.delete(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    listAdmin: (
      query: ListQuery,
      { details, user }: { details: boolean; user?: AdminUser }
    ) => depots.findAdminPage(query, adminFilters(user), { details }),

    getAdmin: async (id: string, details: boolean) => {
      const depot = await depots.findAdminById(id, { details })
      if (!depot) {
        throw notFound(id)
      }
      return depot
    },

    createAdmin: (input: unknown) =>
      create(validate<DepotInput>(schemas.depotAdmin, input)),

    getForAuthorization: async (id: string, activeOnly: boolean) => {
      const depot = await depots.findForAuthorization(id, { activeOnly })
      if (!depot) {
        throw notFound(id)
      }
      return depot
    },

    // For entry contact messages: the active depot and whom to send them to.
    getWithOwners: async (id: string) => {
      const depot = await depots.findWithOwners(id)
      if (!depot) {
        throw notFound(id)
      }
      return depot
    },

    isInAdminOrigins: (id: string, userId: string) =>
      depots.isInAdminOrigins(id, userId)
  }
}
