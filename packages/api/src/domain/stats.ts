import type { Database } from '../db/kysely.ts'
import { createStatsRepository } from '../repositories/stats.ts'

export const createStatsDomain = (db: Database) => {
  const stats = createStatsRepository(db)

  return {
    list: async () => {
      const [farms, depots, initiatives, users] = await Promise.all([
        stats.countEntries('farms'),
        stats.countEntries('depots'),
        stats.countEntries('initiatives'),
        stats.countUsersByState()
      ])
      return [
        { id: 1, resource: 'farms', stats: farms },
        { id: 2, resource: 'depots', stats: depots },
        { id: 3, resource: 'initiatives', stats: initiatives },
        { id: 4, resource: 'users', stats: users }
      ]
    }
  }
}
