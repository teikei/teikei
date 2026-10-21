// Translates the Feathers query syntax into Kysely for an allowlist of columns
// per resource: findPage for the paginated admin services, findMatching for the
// unpaginated public lookups, which accept the same operators.
//
// What ra-data-feathers emits for the lookup resources (admin/products, goals,
// badges, roles, origins):
//
//   getList (List pages, ReferenceArrayInput choices, useGetList)
//     $limit=<perPage>&$skip=<perPage * (page - 1)>
//     $sort[<field>]=1 | -1
//     <field>=<value>          List filters (none of the lookup lists has one)
//     origin[$ne]=default      admin/origins choices in the user form
//   getMany (ReferenceArrayInput values)
//     id[$in][]=<id>...&$limit=<number of ids>
//   getManyReference           not used for the lookups
//
// $ilike is not sent by the admin today but stays supported, as the
// feathers-objection services whitelisted it. Everything else is rejected with
// BadRequest instead of being silently ignored.
import { filterQuery } from '@feathersjs/adapter-commons'
import { BadRequest } from '@feathersjs/errors'
import type { Paginated, Query } from '@feathersjs/feathers'
import { sql, type SelectQueryBuilder } from 'kysely'

// A client's Feathers query, which only this module interprets. Domains pass it
// through to the repositories unchanged.
export type ListQuery = Query

const FILTERS = ['$limit', '$skip', '$sort']

const OPERATORS: Record<string, 'in' | '<>' | 'ilike'> = {
  $in: 'in',
  $ne: '<>',
  $ilike: 'ilike'
}

// Matches feathers-objection with `paginate: { default: 50 }` and no max.
const PAGINATE = { default: 50 }

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value?.constructor === Object

const assertColumn = (column: string, columns: readonly string[]) => {
  if (!columns.includes(column)) {
    throw new BadRequest(`Invalid query parameter ${column}`)
  }
}

// Applies the conditions and $sort; $limit and $skip are left to the caller.
const applyQuery = <DB, TB extends keyof DB, O>(
  select: SelectQueryBuilder<DB, TB, O>,
  query: Query,
  columns: readonly string[],
  paginate?: typeof PAGINATE
) => {
  for (const key of Object.keys(query)) {
    if (key.startsWith('$') && !FILTERS.includes(key)) {
      throw new BadRequest(`Invalid query parameter ${key}`)
    }
  }
  const { filters, query: where } = filterQuery(query, {
    paginate,
    operators: ['$ilike']
  })

  let filtered = select
  for (const [column, condition] of Object.entries(where)) {
    assertColumn(column, columns)
    const conditions = isPlainObject(condition)
      ? Object.entries(condition)
      : [['=', condition]]
    for (const [operator, value] of conditions) {
      const sqlOperator = operator === '=' ? '=' : OPERATORS[operator]
      if (!sqlOperator) {
        throw new BadRequest(`Invalid query operator ${operator}`)
      }
      const values = sqlOperator === 'in' ? [value].flat() : undefined
      filtered =
        values?.length === 0
          ? filtered.where(sql<boolean>`false`)
          : filtered.where(sql.ref(column), sqlOperator, values ?? value)
    }
  }

  const sort: Record<string, number> = filters.$sort ?? {}
  let sorted = filtered
  for (const [column, direction] of Object.entries(sort)) {
    assertColumn(column, columns)
    sorted = sorted.orderBy(sql.ref(column), direction === -1 ? 'desc' : 'asc')
  }

  return { filters, filtered, sorted }
}

// For the paginated admin services: { total, limit, skip, data }.
export const findPage = async <DB, TB extends keyof DB, O>(
  select: SelectQueryBuilder<DB, TB, O>,
  query: Query,
  columns: readonly string[]
): Promise<Paginated<O>> => {
  const { filters, filtered, sorted } = applyQuery(
    select,
    query,
    columns,
    PAGINATE
  )

  const limit: number = filters.$limit
  const skip: number = filters.$skip ?? 0
  const [{ total }, data] = await Promise.all([
    filtered
      .clearSelect()
      .select((eb) => eb.fn.countAll<string>().as('total'))
      // clearSelect() loses the row type when the table is generic
      .$castTo<{ total: string }>()
      .executeTakeFirstOrThrow(),
    sorted.limit(limit).offset(skip).execute()
  ])

  return { total: Number(total), limit, skip, data }
}

// For the unpaginated public services: a plain array, limited only when the
// caller asks for it.
export const findMatching = async <DB, TB extends keyof DB, O>(
  select: SelectQueryBuilder<DB, TB, O>,
  query: Query,
  columns: readonly string[]
): Promise<O[]> => {
  const { filters, sorted } = applyQuery(select, query, columns)

  let rows = sorted
  if (filters.$limit !== undefined) {
    rows = rows.limit(filters.$limit)
  }
  if (filters.$skip !== undefined) {
    rows = rows.offset(filters.$skip)
  }
  return rows.execute()
}
