import BaseModel from '../models/base'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../logger'

const JOB_NAME = 'create login reminders'
const SCHEDULE_EVERY_QUARTER = '0 16 1 3,6,9,12 *'

export const prettyTimestamp = () => {
  const date = new Date()
  return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString(
    'de-DE',
  )}`
}

const addEmailMessagesToQueue = async (id) => {
  await BaseModel.knex().raw(
    `insert into email_messages (user_id, campaign_id)
     select distinct(u.id), ${id} from users u, farms_users fu
     where u.is_verified = true
     and fu.user_id = u.id
     and u.state = 'RECENT_LOGIN'
     and u.last_login < current_date - interval '1 year'`,
  )
}

const updateUserStates = async () => {
  await BaseModel.knex().raw(
    `update users
     set state = 'REMINDER_SENT',
     reactivation_token = '${uuidv4()}',
     reminder_sent_at = '${new Date().toISOString()}'
     where id in (
     select distinct(u.id) from users u, farms_users fu
     where u.is_verified = true
     and fu.user_id = u.id
     and u.state = 'RECENT_LOGIN'
     and u.last_login < current_date - interval '1 year'
     )`,
  )
}

export default (app) => {
  app.jobs.schedule(5, JOB_NAME, SCHEDULE_EVERY_QUARTER, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    try {
      logger.info(`creating email campaign`)
      const { id } = await app.service('/admin/email-campaigns').create({
        name: `Login Reminders ${prettyTimestamp()}`,
        template: 'login_reminder',
        status: 'SENT',
      })
      await addEmailMessagesToQueue(id)
      logger.info(`email campaign with id ${id} sent`)
      logger.info('updating user states')
      await updateUserStates()
    } catch (e) {
      logger.error(e)
    }
    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
