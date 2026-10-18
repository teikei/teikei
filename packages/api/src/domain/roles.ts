import type { Id, Query } from '@feathersjs/feathers'
import { notFound, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createRolesRepository, type RoleRow } from '../repositories/roles.ts'

export type Role = RoleRow & { type: 'Role'; link: string }

const toRole = (row: RoleRow): Role => ({
  ...row,
  type: 'Role',
  link: `/roles/${row.id}`
})

export const createRolesDomain = (db: Database) => {
  const roles = createRolesRepository(db)

  return {
    list: async (query: Query) => {
      const page = await withFeathersErrors(roles.find(query))
      return { ...page, data: page.data.map(toRole) }
    },

    get: async (id: Id) => {
      const row = await withFeathersErrors(roles.findById(String(id)))
      if (!row) {
        throw notFound(id)
      }
      return toRole(row)
    }
  }
}
