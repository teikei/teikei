import type { Id, Query } from '@feathersjs/feathers'
import type { Insertable, Transaction, Updateable } from 'kysely'
import { notFound, validate, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import type { DB, Depots } from '../db/types.ts'
import { schemas } from '../models/validation/index.js'
import {
  createDepotsRepository,
  type DepotRow
} from '../repositories/depots.ts'
import {
  DEPOT_COLUMNS,
  ENTRY_COLUMNS,
  FARM_COLUMNS
} from '../repositories/entries.ts'
import { createFarmsRepository } from '../repositories/farms.ts'
import { replaceRelation } from '../repositories/relations.ts'
import { ADMIN_OWNER_COLUMNS, OWNER_COLUMNS } from '../repositories/users.ts'
import {
  adminFilters,
  byEntry,
  toDepot,
  toFarm,
  toId,
  toOwner,
  withoutServerFields,
  type AdminUser,
  type RelationIds
} from './entryRecords.ts'
import { toProduct } from './products.ts'

type Relations = {
  farms?: RelationIds
  ownerships?: RelationIds
}

type DepotInput = Insertable<Depots> & Relations

export type DepotPatch = Updateable<Depots> & Relations

export const createDepotsDomain = (db: Database) => {
  const depots = createDepotsRepository(db)
  const farms = createFarmsRepository(db)

  // Public details: the depot's farms, each with its products.
  const withPublicRelations = async (rows: DepotRow[]) => {
    const depotFarms = await depots.findFarms(rows.map(toId), ENTRY_COLUMNS)
    const products = byEntry(
      await farms.findProducts(depotFarms.map(toId)),
      toProduct
    )
    const farmsOf = byEntry(depotFarms, (farm) => ({
      ...toFarm(farm),
      products: products(farm.id)
    }))
    return rows.map((row) => ({ ...toDepot(row), farms: farmsOf(row.id) }))
  }

  // Admin reads: relation ids, or full records for $details.
  const withAdminRelations = async (rows: DepotRow[], details: boolean) => {
    const ids = rows.map(toId)
    const ownerships = details
      ? byEntry(await depots.findOwners(ids, ADMIN_OWNER_COLUMNS), toOwner)
      : byEntry(await depots.findOwners(ids, ['id']), toId)
    const depotFarms = details
      ? byEntry(await depots.findFarms(ids, FARM_COLUMNS), toFarm)
      : byEntry(await depots.findFarms(ids, ['id']), toId)
    return rows.map((row) => ({
      ...toDepot(row),
      ownerships: ownerships(row.id),
      farms: depotFarms(row.id)
    }))
  }

  // Replaces the relations present in the input and answers with their full
  // records, like the relate hooks did.
  const writeRelations = async (
    trx: Transaction<DB>,
    id: string,
    { farms: farmIds, ownerships }: Relations
  ) => {
    const ids = [id]
    const written: Record<string, unknown[]> = {}
    if (farmIds) {
      await replaceRelation(
        trx,
        'farmsDepots',
        'depotId',
        id,
        'farmId',
        farmIds
      )
      written.farms = byEntry(
        await depots.findFarms(ids, FARM_COLUMNS, trx),
        toFarm
      )(id)
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
      written.ownerships = byEntry(
        await depots.findOwners(ids, ADMIN_OWNER_COLUMNS, trx),
        toOwner
      )(id)
    }
    return written
  }

  const create = (input: DepotInput, ownerId?: string) => {
    const {
      farms: farmIds,
      ownerships,
      ...columns
    } = withoutServerFields(input)
    return withFeathersErrors(
      db.transaction().execute(async (trx) => {
        const row = await depots.insert(
          { ...columns, createdAt: new Date() },
          trx
        )
        const relations = await writeRelations(trx, row.id, {
          farms: farmIds,
          ownerships
        })
        if (ownerId) {
          await replaceRelation(
            trx,
            'depotsUsers',
            'depotId',
            row.id,
            'userId',
            [ownerId]
          )
        }
        return { ...toDepot(row), ...relations }
      })
    )
  }

  const patch = (id: Id, input: DepotPatch) => {
    const {
      farms: farmIds,
      ownerships,
      ...columns
    } = withoutServerFields(input)
    return withFeathersErrors(
      db.transaction().execute(async (trx) => {
        const row = await depots.update(
          String(id),
          { ...columns, updatedAt: new Date() },
          trx
        )
        if (!row) {
          throw notFound(id)
        }
        const relations = await writeRelations(trx, row.id, {
          farms: farmIds,
          ownerships
        })
        return { ...toDepot(row), ...relations }
      })
    )
  }

  const findById = async (id: Id, activeOnly: boolean) => {
    const row = await withFeathersErrors(
      depots.findById(String(id), { activeOnly })
    )
    if (!row) {
      throw notFound(id)
    }
    return row
  }

  return {
    list: async ({ $details, ...query }: Query) => {
      if ($details !== 'true') {
        const rows = await withFeathersErrors(
          depots.findActive(query, ENTRY_COLUMNS)
        )
        return rows.map(toDepot)
      }
      const rows = await withFeathersErrors(
        depots.findActive(query, DEPOT_COLUMNS)
      )
      return withFeathersErrors(withPublicRelations(rows))
    },

    get: async (id: Id) => {
      const [depot] = await withFeathersErrors(
        withPublicRelations([await findById(id, true)])
      )
      return depot
    },

    create: (input: unknown, ownerId?: string) =>
      create(validate<DepotInput>(schemas.depot, input), ownerId),

    patch: (id: Id, input: DepotPatch) => patch(id, input),

    remove: async (id: Id) => {
      const row = await withFeathersErrors(depots.delete(String(id)))
      if (!row) {
        throw notFound(id)
      }
      return toDepot(row)
    },

    listAdmin: async ({ $details, ...query }: Query, user?: AdminUser) => {
      const page = await withFeathersErrors(
        depots.findPage(query, adminFilters(user))
      )
      return {
        ...page,
        data: await withFeathersErrors(
          withAdminRelations(page.data, $details === 'true')
        )
      }
    },

    getAdmin: async (id: Id, details: boolean) => {
      const [depot] = await withFeathersErrors(
        withAdminRelations([await findById(id, false)], details)
      )
      return depot
    },

    createAdmin: (input: unknown) =>
      create(validate<DepotInput>(schemas.depotAdmin, input)),

    getForAuthorization: async (id: Id, activeOnly: boolean) => {
      const depot = await withFeathersErrors(
        depots.findForAuthorization(String(id), { activeOnly })
      )
      if (!depot) {
        throw notFound(id)
      }
      return depot
    },

    // For entry contact messages: the active depot and whom to send them to.
    getWithOwners: async (id: Id) => {
      const row = await findById(id, true)
      const owners = await withFeathersErrors(
        depots.findOwners([row.id], OWNER_COLUMNS)
      )
      return {
        ...toDepot(row),
        ownerships: byEntry(owners, toOwner)(row.id)
      }
    },

    isInAdminOrigins: (id: Id, userId: Id) =>
      withFeathersErrors(depots.isInAdminOrigins(String(id), String(userId)))
  }
}
