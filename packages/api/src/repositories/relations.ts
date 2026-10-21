import { sql } from 'kysely'
import type { Database } from '../db/kysely.ts'

// Relations are written as lists of related ids.
export type RelationIds = readonly (string | number)[]

export type JoinTable =
  | 'farmsBadges'
  | 'farmsDepots'
  | 'farmsProducts'
  | 'farmsUsers'
  | 'depotsUsers'
  | 'initiativesBadges'
  | 'initiativesGoals'
  | 'initiativesUsers'

// Makes the join rows of one entry match `ids`: removes the others and adds
// the missing ones. It runs two statements, so callers pass a transaction; an
// unknown id violates the foreign key, so that transaction fails with it.
export const replaceRelation = async (
  trx: Database,
  joinTable: JoinTable,
  ownerColumn: string,
  ownerId: string,
  relatedColumn: string,
  ids: RelationIds
) => {
  const table = sql.table(joinTable)
  const owner = sql.ref(ownerColumn)
  const related = sql.ref(relatedColumn)
  const wanted = [...new Set(ids.map(String))]

  await sql`
    delete from ${table}
    where ${owner} = ${ownerId}
      and not (${related} = any(${wanted}::bigint[]))
  `.execute(trx)
  await sql`
    insert into ${table} (${owner}, ${related})
    select ${ownerId}, wanted.id
    from unnest(${wanted}::bigint[]) as wanted(id)
    where not exists (
      select from ${table}
      where ${owner} = ${ownerId} and ${related} = wanted.id
    )
  `.execute(trx)
}

// Relation loaders take the ids of every entry in a response, so each relation
// costs one query, and order the related records by id, as production returned
// them under Objection. An empty list would render `in ()`, which Postgres
// rejects.
export const forEntries = async <T>(
  ids: readonly string[],
  load: (ids: readonly string[]) => Promise<T[]>
): Promise<T[]> => (ids.length === 0 ? [] : load(ids))

export const toId = ({ id }: { id: string }) => id

type Tagged = { entryId: string | null }

// Groups the rows of a relation loader by entry, without their entryId tag.
export function byEntry<R extends Tagged>(
  rows: R[]
): (id: string) => Omit<R, 'entryId'>[]
export function byEntry<R extends Tagged, T>(
  rows: R[],
  toRecord: (row: Omit<R, 'entryId'>) => T
): (id: string) => T[]
export function byEntry<R extends Tagged>(
  rows: R[],
  toRecord: (row: Omit<R, 'entryId'>) => unknown = (row) => row
) {
  const grouped = new Map<string, unknown[]>()
  for (const { entryId, ...row } of rows) {
    const records = grouped.get(String(entryId)) ?? []
    records.push(toRecord(row))
    grouped.set(String(entryId), records)
  }
  return (id: string) => grouped.get(id) ?? []
}
