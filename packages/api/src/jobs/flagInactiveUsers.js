import BaseModel from '../models/base'
import { logger } from '../logger'

const flagInactiveUsers = async () => {
  await BaseModel.knex().raw(
    `update users
       set state = 'NO_RESPONSE',
       reactivation_token = null
       where state = 'SECOND_REMINDER_SENT'
       and reminder_sent_at <= current_date - interval '8 weeks'`,
  )
}

const JOB_NAME = 'deactivate inactive users'
const EVERY_MONDAY_AT_6 = '0 18 * * 1'

export default (app) => {
  app.jobs.schedule(7, JOB_NAME, EVERY_MONDAY_AT_6, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    logger.info('setting no_response state on users')
    await flagInactiveUsers()

    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
