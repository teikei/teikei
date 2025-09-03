import { logger } from '../logger'
import BaseModel from '../models/base'

const JOB_NAME = 'create login reminders'
const SCHEDULE_EVERY_QUARTER = '0 16 1 3,6,9,12 *'

export const prettyTimestamp = () => {
  const date = new Date()
  return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString(
    'de-DE'
  )}`
}

const updateUsersAndQueueEmails = async (campaignId) => {
  const knex = BaseModel.knex()
  const now = new Date().toISOString()

  const query = `
    with affected as (
      update users u
      set state = 'REMINDER_SENT',
          reactivation_token = gen_random_uuid(),
          reminder_sent_at = ?
      from farms_users fu
      where fu.user_id = u.id
        and u.is_verified = true
        and u.state = 'RECENT_LOGIN'
        and u.last_login < current_date - interval '1 year'
      returning u.id
    )
    insert into email_messages (user_id, campaign_id)
    select distinct a.id, ? from affected a
  `

  await knex.transaction(async (trx) => {
    await trx.raw(query, [now, campaignId])
  })
}

export default (app) => {
  app.jobs.schedule(5, JOB_NAME, SCHEDULE_EVERY_QUARTER, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    try {
      logger.info(`creating email campaign`)
      const { id } = await app.service('/admin/email-campaigns').create({
        name: `Login Reminders ${prettyTimestamp()}`,
        template: 'login_reminder',
        status: 'SENT'
      })
      await updateUsersAndQueueEmails(id)
      logger.info(`email campaign with id ${id} prepared and messages queued`)
    } catch (e) {
      logger.error(e)
    }
    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
