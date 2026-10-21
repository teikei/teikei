import type { Query } from '@feathersjs/feathers'
import type { Selectable } from 'kysely'
import { findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Roles } from '../db/types.ts'

export type RoleRow = Selectable<Roles>

const QUERYABLE: (keyof Roles)[] = ['id', 'name']

export const createRolesRepository = (db: Database) => ({
  find: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('roles').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx.selectFrom('roles').selectAll().where('id', '=', id).executeTakeFirst(),

  findByName: (name: string, trx: Database = db) =>
    trx
      .selectFrom('roles')
      .selectAll()
      .where('name', '=', name)
      .executeTakeFirstOrThrow()
})
