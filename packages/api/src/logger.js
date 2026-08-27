import { createLogger, format, transports } from 'winston'

const isProduction = process.env.NODE_ENV === 'production'
const level = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')

const REDACTED = '[REDACTED]'

const SENSITIVE_KEY =
  /^(api_?key|access_token|authorization|cookie|password|proxy-authorization|secret|set-cookie|token|x-api-key|x-postmark-server-token)$/i

const redact = (value, seen) => {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  if (Array.isArray(value)) return value.map((entry) => redact(entry, seen))

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_KEY.test(key) ? REDACTED : redact(entry, seen)
    ])
  )
}

const redactResponse = (response, seen) => ({
  status: response.status,
  statusText: response.statusText,
  headers: redact(response.headers, seen),
  data: redact(response.data, seen)
})

const serializeError = (error) => {
  const seen = new WeakSet()
  const serialized = {
    name: error.name,
    message: error.message,
    stack: error.stack
  }
  if (error.code !== undefined) serialized.code = error.code
  if (error.isAxiosError) {
    serialized.status = error.status
    serialized.config = redact(error.config, seen)
    if (error.response) {
      serialized.response = redactResponse(error.response, seen)
    }
  }
  return serialized
}

export const redactSecrets = format((info) => {
  if (info.error instanceof Error) {
    info.error = serializeError(info.error)
  }

  if (info.config?.url || info.config?.method) {
    const seen = new WeakSet()
    info.config = redact(info.config, seen)
    if (info.response) info.response = redactResponse(info.response, seen)
    delete info.request
  }

  return info
})

const consoleFormat = isProduction
  ? format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      redactSecrets(),
      format.json()
    )
  : format.combine(
      format.colorize(),
      format.timestamp({ format: 'HH:mm:ss' }),
      format.splat(),
      format.errors({ stack: true }),
      redactSecrets(),
      format.printf(({ level, message, timestamp, stack, ...meta }) => {
        const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
        return stack
          ? `${timestamp} ${level}: ${message}\n${stack}${rest}`
          : `${timestamp} ${level}: ${message}${rest}`
      })
    )

export const logger = createLogger({
  level,
  format: consoleFormat,
  transports: [new transports.Console({ handleExceptions: true })],
  exceptionHandlers: [new transports.Console()]
})
