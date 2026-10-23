import { createLogger, format, transports } from 'winston'

const isProduction = process.env.NODE_ENV === 'production'
const level = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')

const REDACTED = '[REDACTED]'

const SENSITIVE_KEY =
  /^(api_?key|access_token|authorization|cookie|password|proxy-authorization|secret|set-cookie|token|x-api-key|x-postmark-server-token)$/i

// Axios errors carry the request config and the response, either of which may
// hold credentials.
type HttpResponse = {
  status: number
  statusText: string
  headers: unknown
  data: unknown
}

type LoggedError = Error & {
  code?: unknown
  isAxiosError?: boolean
  status?: number
  config?: unknown
  response?: HttpResponse
}

type SerializedError = {
  name: string
  message: string
  stack?: string
  code?: unknown
  status?: number
  config?: unknown
  response?: HttpResponse
}

const redact = (value: unknown, seen: WeakSet<object>): unknown => {
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

const redactResponse = (
  response: HttpResponse,
  seen: WeakSet<object>
): HttpResponse => ({
  status: response.status,
  statusText: response.statusText,
  headers: redact(response.headers, seen),
  data: redact(response.data, seen)
})

const serializeError = (error: LoggedError) => {
  const seen = new WeakSet<object>()
  const serialized: SerializedError = {
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

  const config = info.config as { url?: string; method?: string } | undefined
  if (config?.url || config?.method) {
    const seen = new WeakSet<object>()
    info.config = redact(config, seen)
    if (info.response) {
      info.response = redactResponse(info.response as HttpResponse, seen)
    }
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
  transports: [new transports.Console()],
  exceptionHandlers: [new transports.Console()]
})
