// Query strings sent to the entry lists, from the production access logs
// (2026-10-06 to 2026-10-20) and the admin's ra-data-feathers calls.
//
// entries
//   find   (no parameters)                    embed and legacy map
//          mine=true                          the signed-in user's entries
//          mine=true&type=<type>&id=<id>      one of them, before editing
//          Any other parameter is ignored.
//
// admin/entries (admin/users/:userId/entries delegates here)
//   find   userId=<id>&$limit&$skip&$sort[id]=-1   UserForm entries tab
//          (getManyReference); only userId is read.
import type { Query } from '@feathersjs/feathers'
import { withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createDepotsRepository } from '../repositories/depots.ts'
import { ENTRY_COLUMNS, PUBLIC_ENTRY_COLUMNS } from '../repositories/entries.ts'
import { createFarmsRepository } from '../repositories/farms.ts'
import { createInitiativesRepository } from '../repositories/initiatives.ts'
import { byEntry, toDepot, toFarm, toId, toInitiative } from './entryRecords.ts'
import { toGoal } from './goals.ts'
import { toProduct } from './products.ts'

type Row = { id: string }

export const createEntriesDomain = (db: Database) => {
  const farms = createFarmsRepository(db)
  const depots = createDepotsRepository(db)
  const initiatives = createInitiativesRepository(db)

  // Farms with their products, depots, initiatives with their goals.
  const merge = async (
    farmRows: Row[],
    depotRows: Row[],
    initiativeRows: Row[]
  ) => {
    const products = byEntry(
      await farms.findProducts(farmRows.map(toId)),
      toProduct
    )
    const goals = byEntry(
      await initiatives.findGoals(initiativeRows.map(toId)),
      toGoal
    )
    return [
      ...farmRows.map((row) => ({
        ...toFarm(row),
        products: products(row.id)
      })),
      ...depotRows.map(toDepot),
      ...initiativeRows.map((row) => ({
        ...toInitiative(row),
        goals: goals(row.id)
      }))
    ]
  }

  const listActive = async () =>
    merge(
      await farms.findActive({}, PUBLIC_ENTRY_COLUMNS),
      await depots.findActive({}, PUBLIC_ENTRY_COLUMNS),
      await initiatives.findActive({}, PUBLIC_ENTRY_COLUMNS)
    )

  const listOwned = async (userId: string, { type, id }: Query) => {
    const owned = { activeOnly: true }
    const entries = await merge(
      await farms.findOwnedBy(userId, ENTRY_COLUMNS, owned),
      await depots.findOwnedBy(userId, ENTRY_COLUMNS, owned),
      await initiatives.findOwnedBy(userId, ENTRY_COLUMNS, owned)
    )
    return id && type
      ? entries.filter(
          (entry) => entry.id === id && entry.type.toLowerCase() === type
        )
      : entries
  }

  const listForAdmin = async (userId: string) => {
    const all = { activeOnly: false }
    const entries = [
      ...(await farms.findOwnedBy(userId, ENTRY_COLUMNS, all)).map((row) => ({
        ...row,
        type: 'Farm'
      })),
      ...(await depots.findOwnedBy(userId, ENTRY_COLUMNS, all)).map((row) => ({
        ...row,
        type: 'Depot'
      })),
      ...(await initiatives.findOwnedBy(userId, ENTRY_COLUMNS, all)).map(
        (row) => ({ ...row, type: 'Initiative' })
      )
    ]
    return entries.map((entry) => ({
      ...entry,
      id: `${entry.type}_${entry.id}`,
      _id: entry.id
    }))
  }

  return {
    // The public map listing ignores the client query, so it cannot widen the
    // columns or reach the owners.
    listActive: () => withFeathersErrors(listActive()),

    // The signed-in user's active entries, with the owner-only address
    // columns; `type` and `id` narrow it to one entry.
    listOwned: async (userId: string | undefined, query: Query) =>
      userId ? withFeathersErrors(listOwned(userId, query)) : [],

    // Every entry of a user for the admin, active or not, keyed by type and id
    // as one react-admin resource, without `link`.
    listForAdmin: (userId: string) => withFeathersErrors(listForAdmin(userId))
  }
}
