import app from './app'

const port = app.get('port')
const server = app.listen(port)

process.on('unhandledRejection', (reason, p) =>
  app.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  app.info(
    `Teikei API running on http://%s:%d in ${process.env.NODE_ENV ||
      'development'} mode.`,
    app.get('host'),
    port
  )
)
