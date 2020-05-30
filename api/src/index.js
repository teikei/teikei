import app from './app'

const port = app.get('port')
const server = app.listen(port)

process.on('unhandledRejection', (reason, p) =>
  app.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () => {
  app.info(
    `Teikei API is running on ${app.get(
      'host'
    )}:${port} in ${app.getEnv()} mode`
  )
  app.info('using database', app.get('postgres').connection)
  if (app.get('enableJobQueues')) {
    app.info('using redis', app.get('redis').url)
  }
  app.info('')
})
