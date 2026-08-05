import { logger } from '../logger'
import BaseModel from '../models/base'
import { prettyTimestamp } from './createLoginReminders'

const JOB_NAME = 'create second login reminders'
const EVERY_MONDAY_AT_5 = '0 17 * * 1'

const updateUsersAndQueueEmails = async (campaignId) => {
  const knex = BaseModel.knex()
  const now = new Date().toISOString()

  const query = `
    with affected as (
      update users u
      set state = 'SECOND_REMINDER_SENT',
          second_reminder_sent_at = ?
      from farms_users fu
      where fu.user_id = u.id
        and u.is_verified = true
        and u.state = 'REMINDER_SENT'
        and u.reminder_sent_at < current_date - interval '7 weeks'
      returning u.id
    )
    insert into email_messages (user_id, campaign_id)
    select distinct a.id, ?::bigint from affected a
  `

  await knex.transaction(async (trx) => {
    await trx.raw(query, [now, campaignId])
  })
}

export default (app) => {
  app.jobs.schedule(6, JOB_NAME, EVERY_MONDAY_AT_5, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    try {
      logger.info(`creating email campaign`)
      const { id } = await app.service('/admin/email-campaigns').create({
        name: `Second Login Reminders ${prettyTimestamp()}`,
        template: 'second_login_reminder',
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
