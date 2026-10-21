import type { Id, Query } from '@feathersjs/feathers'
import type { Insertable, Transaction, Updateable } from 'kysely'
import { notFound, validate, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import type { DB, Farms } from '../db/types.ts'
import { schemas } from '../models/validation/index.js'
import {
  BADGE_COLUMNS,
  BADGE_SUMMARY,
  DEPOT_COLUMNS,
  ENTRY_COLUMNS,
  FARM_COLUMNS,
  NESTED_DEPOT_COLUMNS
} from '../repositories/entries.ts'
import { createFarmsRepository, type FarmRow } from '../repositories/farms.ts'
import { replaceRelation } from '../repositories/relations.ts'
import { ADMIN_OWNER_COLUMNS, OWNER_COLUMNS } from '../repositories/users.ts'
import { toBadge } from './badges.ts'
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
  products?: RelationIds
  badges?: RelationIds
  depots?: RelationIds
  ownerships?: RelationIds
}

type FarmInput = Insertable<Farms> & Relations

export type FarmPatch = Updateable<Farms> & Relations

export const createFarmsDomain = (db: Database) => {
  const farms = createFarmsRepository(db)

  // Public reads: products always, depots and badges in the detail shape.
  const withPublicRelations = async (
    rows: Pick<FarmRow, 'id'>[],
    details: boolean
  ) => {
    const ids = rows.map(toId)
    const products = byEntry(await farms.findProducts(ids), toProduct)
    if (!details) {
      return rows.map((row) => ({ ...toFarm(row), products: products(row.id) }))
    }
    const depots = byEntry(
      await farms.findDepots(ids, NESTED_DEPOT_COLUMNS),
      toDepot
    )
    const badges = byEntry(await farms.findBadges(ids, BADGE_SUMMARY), toBadge)
    return rows.map((row) => ({
      ...toFarm(row),
      depots: depots(row.id),
      products: products(row.id),
      badges: badges(row.id)
    }))
  }

  // Admin reads: relation ids, or full records for the API partner's $details.
  const withAdminRelations = async (rows: FarmRow[], details: boolean) => {
    const ids = rows.map(toId)
    const products = byEntry(await farms.findProducts(ids), (product) =>
      details ? toProduct(product) : product.id
    )
    const ownerships = details
      ? byEntry(await farms.findOwners(ids, ADMIN_OWNER_COLUMNS), toOwner)
      : byEntry(await farms.findOwners(ids, ['id']), toId)
    const badges = details
      ? byEntry(await farms.findBadges(ids, BADGE_COLUMNS), toBadge)
      : byEntry(await farms.findBadges(ids, ['id']), toId)
    const depots = details
      ? byEntry(await farms.findDepots(ids, DEPOT_COLUMNS), toDepot)
      : byEntry(await farms.findDepots(ids, ['id']), toId)
    return rows.map((row) => ({
      ...toFarm(row),
      products: products(row.id),
      ownerships: ownerships(row.id),
      badges: badges(row.id),
      depots: depots(row.id)
    }))
  }

  // Replaces the relations present in the input and answers with their full
  // records, like the relate hooks did.
  const writeRelations = async (
    trx: Transaction<DB>,
    id: string,
    { products, badges, depots, ownerships }: Relations
  ) => {
    const ids = [id]
    const written: Record<string, unknown[]> = {}
    if (products) {
      await replaceRelation(
        trx,
        'farmsProducts',
        'farmId',
        id,
        'productId',
        products
      )
      written.products = byEntry(
        await farms.findProducts(ids, trx),
        toProduct
      )(id)
    }
    if (badges) {
      await replaceRelation(trx, 'farmsBadges', 'farmId', id, 'badgeId', badges)
      written.badges = byEntry(
        await farms.findBadges(ids, BADGE_COLUMNS, trx),
        toBadge
      )(id)
    }
    if (depots) {
      await replaceRelation(trx, 'farmsDepots', 'farmId', id, 'depotId', depots)
      written.depots = byEntry(
        await farms.findDepots(ids, DEPOT_COLUMNS, trx),
        toDepot
      )(id)
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
      written.ownerships = byEntry(
        await farms.findOwners(ids, ADMIN_OWNER_COLUMNS, trx),
        toOwner
      )(id)
    }
    return written
  }

  const create = (input: FarmInput, ownerId?: string) => {
    const { products, badges, depots, ownerships, ...columns } =
      withoutServerFields(input)
    return withFeathersErrors(
      db.transaction().execute(async (trx) => {
        const row = await farms.insert(
          { ...columns, createdAt: new Date() },
          trx
        )
        const relations = await writeRelations(trx, row.id, {
          products,
          badges,
          depots,
          ownerships
        })
        if (ownerId) {
          await replaceRelation(trx, 'farmsUsers', 'farmId', row.id, 'userId', [
            ownerId
          ])
        }
        return { ...toFarm(row), ...relations }
      })
    )
  }

  const patch = (id: Id, input: FarmPatch) => {
    const { products, badges, depots, ownerships, ...columns } =
      withoutServerFields(input)
    return withFeathersErrors(
      db.transaction().execute(async (trx) => {
        const row = await farms.update(
          String(id),
          { ...columns, updatedAt: new Date() },
          trx
        )
        if (!row) {
          throw notFound(id)
        }
        const relations = await writeRelations(trx, row.id, {
          products,
          badges,
          depots,
          ownerships
        })
        return { ...toFarm(row), ...relations }
      })
    )
  }

  const findById = async (id: Id, activeOnly: boolean) => {
    const row = await withFeathersErrors(
      farms.findById(String(id), { activeOnly })
    )
    if (!row) {
      throw notFound(id)
    }
    return row
  }

  return {
    list: async ({ $details, ...query }: Query) => {
      const details = $details === 'true'
      const rows = await withFeathersErrors(
        farms.findActive(query, details ? FARM_COLUMNS : ENTRY_COLUMNS)
      )
      return withFeathersErrors(withPublicRelations(rows, details))
    },

    get: async (id: Id) => {
      const [farm] = await withFeathersErrors(
        withPublicRelations([await findById(id, true)], true)
      )
      return farm
    },

    create: (input: unknown, ownerId?: string) =>
      create(validate<FarmInput>(schemas.farm, input), ownerId),

    patch: (id: Id, input: FarmPatch) => patch(id, input),

    remove: async (id: Id) => {
      const row = await withFeathersErrors(farms.delete(String(id)))
      if (!row) {
        throw notFound(id)
      }
      return toFarm(row)
    },

    listAdmin: async (
      { $details, hasBadge, notHasBadge, ...query }: Query,
      user: AdminUser | undefined
    ) => {
      const page = await withFeathersErrors(
        farms.findPage(query, adminFilters(user, { hasBadge, notHasBadge }))
      )
      return {
        ...page,
        data: await withFeathersErrors(
          withAdminRelations(page.data, $details === 'true')
        )
      }
    },

    getAdmin: async (id: Id, details: boolean) => {
      const [farm] = await withFeathersErrors(
        withAdminRelations([await findById(id, false)], details)
      )
      return farm
    },

    createAdmin: (input: unknown) =>
      create(validate<FarmInput>(schemas.farmAdmin, input)),

    getForAuthorization: async (id: Id, activeOnly: boolean) => {
      const farm = await withFeathersErrors(
        farms.findForAuthorization(String(id), { activeOnly })
      )
      if (!farm) {
        throw notFound(id)
      }
      return farm
    },

    // For entry contact messages: the active farm and whom to send them to.
    getWithOwners: async (id: Id) => {
      const row = await findById(id, true)
      const owners = await withFeathersErrors(
        farms.findOwners([row.id], OWNER_COLUMNS)
      )
      return {
        ...toFarm(row),
        ownerships: byEntry(owners, toOwner)(row.id)
      }
    },

    isInAdminOrigins: (id: Id, userId: Id) =>
      withFeathersErrors(farms.isInAdminOrigins(String(id), String(userId)))
  }
}
