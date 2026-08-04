import { errorHandler } from '@feathersjs/express'
import { logger } from '../logger'
import { errorCodes, withErrorCode } from '../utils/errorCodes'

// @feathersjs/express wraps any non-Feathers throw into a GeneralError that
// still carries the original message, so internals like "missing html template
// for ..." would otherwise reach the client. The code lets map-next render its
// own 5xx wording; `message` stays in the payload for logs and legacy clients.
// The status is already set by errorHandler before the formatter runs.
const sendServerError = (error, req, res) => {
  res.json(withErrorCode(error, errorCodes.SERVER_ERROR).toJSON())
}

export default () => errorHandler({ logger, json: { 500: sendServerError } })
