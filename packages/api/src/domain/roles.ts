import { notFound } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import { createRolesRepository } from '../repositories/roles.ts'

export const createRolesDomain = (db: Database) => {
  const roles = createRolesRepository(db)

  return {
    list: (query: ListQuery) => roles.find(query),

    get: async (id: string) => {
      const row = await roles.findById(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    }
  }
}
