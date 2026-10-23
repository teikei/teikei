import type { Application } from '@feathersjs/feathers'
import { createUsersDomain } from '../domain/users.ts'
import { logger } from '../logger.ts'

const JOB_NAME = 'deactivate inactive users'
const EVERY_MONDAY_AT_6 = '0 18 * * 1'

export default (app: Application) => {
  const users = createUsersDomain(app.get('kysely'))

  app.jobs.schedule(7, JOB_NAME, EVERY_MONDAY_AT_6, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    logger.info('setting no_response state on users')
    await users.flagNoResponse()

    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
