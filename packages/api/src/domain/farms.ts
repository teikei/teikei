import { notFound, validate } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createFarmsRepository,
  type FarmChanges,
  type FarmRelations,
  type FarmValues
} from '../repositories/farms.ts'
import { transaction } from '../repositories/transaction.ts'
import {
  adminFilters,
  withoutServerFields,
  type AdminUser,
  type BadgeFilters
} from './entryRules.ts'
import { schemas } from './validation/index.js'

type FarmInput = FarmValues & FarmRelations

export type FarmPatch = FarmChanges & FarmRelations

export const createFarmsDomain = (db: Database) => {
  const farms = createFarmsRepository(db)

  const create = (input: FarmInput, ownerId?: string) => {
    const { products, badges, depots, ownerships, ...columns } =
      withoutServerFields(input)
    return transaction(db, async (tx) => {
      const row = await farms.insert({ ...columns, createdAt: new Date() }, tx)
      const relations = await farms.saveRelations(
        row.id,
        { products, badges, depots, ownerships },
        tx
      )
      if (ownerId) {
        await farms.saveRelations(row.id, { ownerships: [ownerId] }, tx)
      }
      return { ...row, ...relations }
    })
  }

  return {
    list: (query: ListQuery, { details }: { details: boolean }) =>
      details ? farms.findDetails(query) : farms.findSummaries(query),

    get: async (id: string) => {
      const farm = await farms.findDetailsById(id)
      if (!farm) {
        throw notFound(id)
      }
      return farm
    },

    create: (input: unknown, ownerId?: string) =>
      create(validate<FarmInput>(schemas.farm, input), ownerId),

    patch: (id: string, input: FarmPatch) => {
      const { products, badges, depots, ownerships, ...columns } =
        withoutServerFields(input)
      return transaction(db, async (tx) => {
        const row = await farms.update(
          id,
          { ...columns, updatedAt: new Date() },
          tx
        )
        if (!row) {
          throw notFound(id)
        }
        return {
          ...row,
          ...(await farms.saveRelations(
            id,
            { products, badges, depots, ownerships },
            tx
          ))
        }
      })
    },

    remove: async (id: string) => {
      const row = await farms.delete(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    listAdmin: (
      query: ListQuery,
      {
        details,
        user,
        badges
      }: { details: boolean; user?: AdminUser; badges: BadgeFilters }
    ) => farms.findAdminPage(query, adminFilters(user, badges), { details }),

    getAdmin: async (id: string, details: boolean) => {
      const farm = await farms.findAdminById(id, { details })
      if (!farm) {
        throw notFound(id)
      }
      return farm
    },

    createAdmin: (input: unknown) =>
      create(validate<FarmInput>(schemas.farmAdmin, input)),

    getForAuthorization: async (id: string, activeOnly: boolean) => {
      const farm = await farms.findForAuthorization(id, { activeOnly })
      if (!farm) {
        throw notFound(id)
      }
      return farm
    },

    // For entry contact messages: the active farm and whom to send them to.
    getWithOwners: async (id: string) => {
      const farm = await farms.findWithOwners(id)
      if (!farm) {
        throw notFound(id)
      }
      return farm
    },

    isInAdminOrigins: (id: string, userId: string) =>
      farms.isInAdminOrigins(id, userId)
  }
}
