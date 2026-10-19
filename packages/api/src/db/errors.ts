import {
  BadRequest,
  Conflict,
  FeathersError,
  GeneralError,
  NotFound
} from '@feathersjs/errors'
import type { Id } from '@feathersjs/feathers'
import Joi from 'joi'
import pg from 'pg'

const UNIQUE_COLUMNS = /Key \((.+)\)=\(.+\) already exists/

const uniqueColumns = (detail: string | undefined) =>
  UNIQUE_COLUMNS.exec(detail ?? '')?.[1]
    .split(',')
    .map((column) => column.trim().replace(/^"(.*)"$/, '$1'))

// Same classes, messages and data as feathers-objection's error handler (fed by
// db-errors), so clients see the same errors after a service moves to Kysely.
export const toFeathersError = (error: unknown): FeathersError => {
  if (error instanceof FeathersError) {
    return error
  }
  if (!(error instanceof pg.DatabaseError)) {
    return new GeneralError(
      error instanceof Error ? error.message : String(error)
    )
  }

  const { code, table, column, constraint, detail } = error
  const columns = code === '23505' ? uniqueColumns(detail) : undefined

  if (columns) {
    return new Conflict(`${columns.join(', ')} must be unique`, {
      columns,
      table,
      constraint
    })
  }
  if (code === '23502') {
    return new BadRequest(`${column} must not be null`, { column, table })
  }
  if (code === '23503') {
    return new Conflict('Foreign Key Violation', { table, constraint })
  }
  if (code === '23514') {
    return new BadRequest('Check Violation', { table, constraint })
  }
  if (code?.startsWith('23')) {
    return new Conflict('Constraint Violation', { table, constraint })
  }
  if (code?.startsWith('22')) {
    return new BadRequest('Invalid Data')
  }
  return new GeneralError('Unknown Database Error')
}

export const notFound = (id: Id) =>
  new NotFound(`No record found for id '${id}'`)

export const withFeathersErrors = <T>(query: Promise<T>): Promise<T> =>
  query.catch((error: unknown) => {
    throw toFeathersError(error)
  })

export const validate = <T>(
  schema: Joi.PartialSchemaMap<T>,
  input: unknown
): T => {
  const result = Joi.object<T>(schema).validate(input, { abortEarly: false })
  if (result.error) {
    throw new BadRequest(result.error.message, {
      errors: result.error.details
    })
  }
  return result.value
}
