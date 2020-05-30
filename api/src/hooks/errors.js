import { UniqueViolationError } from 'objection-db-errors'
import { FeathersError, Conflict, GeneralError } from '@feathersjs/errors'

const errorHandler = (ctx) => {
  if (!ctx.error) {
    return
  }
  if (ctx.error instanceof UniqueViolationError) {
    const error = new Conflict('Unique Violation Error')
    error.errors = ctx.error.columns
    throw error
  }
  if (ctx.error instanceof FeathersError) {
    throw ctx.error
  }
  throw new GeneralError('unknown error', ctx.error.data)
}

export default errorHandler
