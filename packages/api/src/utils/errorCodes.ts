import type { FeathersError } from '@feathersjs/errors'

// Stable, language-agnostic identifiers travelling in `data.errorCode`. The
// API never localizes: clients map these codes to their own message catalogs.
const errorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  PASSWORD_INCORRECT: 'PASSWORD_INCORRECT',
  CURRENT_PASSWORD_INCORRECT: 'CURRENT_PASSWORD_INCORRECT',
  REACTIVATION_TOKEN_INVALID: 'REACTIVATION_TOKEN_INVALID',
  RESET_TOKEN_INVALID: 'RESET_TOKEN_INVALID',
  RESET_TOKEN_EXPIRED: 'RESET_TOKEN_EXPIRED',
  VERIFICATION_TOKEN_INVALID: 'VERIFICATION_TOKEN_INVALID',
  VERIFICATION_TOKEN_EXPIRED: 'VERIFICATION_TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_NOT_VERIFIED: 'USER_NOT_VERIFIED',
  USER_ALREADY_VERIFIED: 'USER_ALREADY_VERIFIED',
  FORBIDDEN: 'FORBIDDEN',
  FORBIDDEN_FIELDS: 'FORBIDDEN_FIELDS',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR'
} as const

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes]

// FeathersError declares `data` read-only, but the errors are ours to annotate
// until they are thrown.
const withErrorCode = <E extends FeathersError>(error: E, code: ErrorCode) =>
  Object.assign(error, { data: { ...error.data, errorCode: code } })

export { errorCodes, withErrorCode }
