import { createLogger, format, transports } from 'winston'

const isProduction = process.env.NODE_ENV === 'production'
const level = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')

const consoleFormat = isProduction
  ? format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json()
    )
  : format.combine(
      format.colorize(),
      format.timestamp({ format: 'HH:mm:ss' }),
      format.splat(),
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
  exceptionHandlers: [new transports.Console()],
  rejectionHandlers: [new transports.Console()]
})
