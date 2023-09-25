import { UniqueViolationError } from 'objection-db-errors'
import { FeathersError, Conflict, GeneralError } from '@feathersjs/errors'
import _ from 'lodash'

const errorHandler = (ctx) => {
  if (!ctx.error) {
    return
  }
  // FIXME currently using console.log to display DB errors
  // as app.error doesn't display it
  // eslint-disable-next-line no-console
  console.log(_.omit(ctx.error, ['hook']))
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
