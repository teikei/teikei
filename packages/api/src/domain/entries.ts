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
import type { Database } from '../db/kysely.ts'
import { createDepotsRepository } from '../repositories/depots.ts'
import { createFarmsRepository } from '../repositories/farms.ts'
import { createInitiativesRepository } from '../repositories/initiatives.ts'

// Lists of all three entry types, grouped by type.
export const createEntriesDomain = (db: Database) => {
  const farms = createFarmsRepository(db)
  const depots = createDepotsRepository(db)
  const initiatives = createInitiativesRepository(db)

  const listOwned = async (
    userId: string,
    { type, id }: { type?: string; id?: string }
  ) => {
    const owned = {
      farms: await farms.findOwnedMapEntries(userId),
      depots: await depots.findOwnedMapEntries(userId),
      initiatives: await initiatives.findOwnedMapEntries(userId)
    }
    if (!(id && type)) {
      return owned
    }
    const one = <R extends { id: string }>(entryType: string, rows: R[]) =>
      entryType === type ? rows.filter((row) => row.id === id) : []
    return {
      farms: one('farm', owned.farms),
      depots: one('depot', owned.depots),
      initiatives: one('initiative', owned.initiatives)
    }
  }

  return {
    // The public map listing takes no query, so a client cannot widen the
    // columns or reach the owners.
    listActive: async () => ({
      farms: await farms.findMapEntries(),
      depots: await depots.findMapEntries(),
      initiatives: await initiatives.findMapEntries()
    }),

    // The signed-in user's active entries, with the owner-only address
    // columns; `type` and `id` narrow it to one entry.
    listOwned: async (
      userId: string | undefined,
      filter: { type?: string; id?: string }
    ) =>
      userId
        ? listOwned(userId, filter)
        : { farms: [], depots: [], initiatives: [] },

    // Every entry of a user for the admin, active or not.
    listForAdmin: async (userId: string) => ({
      farms: await farms.findAllOwned(userId),
      depots: await depots.findAllOwned(userId),
      initiatives: await initiatives.findAllOwned(userId)
    })
  }
}
