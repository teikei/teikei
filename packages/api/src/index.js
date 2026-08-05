import appLauncher from './app.js'
import { logger } from './logger.js'

const app = appLauncher.startApp()

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) =>
  logger.error('Unhandled Rejection %O', reason)
)

app.listen(port).then(() => {
  logger.info(`Teikei API listening on http://${host}:${port}`)
})
