import BaseModel from '../models/base'
import { prettyTimestamp } from './createLoginReminders'

const JOB_NAME = 'create second login reminders'
const EVERY_MONDAY_AT_5 = '0 17 * * 1'

const addEmailMessagesToQueue = async (id) => {
  await BaseModel.knex().raw(
    `insert into email_messages (user_id, campaign_id)
     select distinct(u.id), ${id} from users u, farms_users fu
     where u.is_verified = true
     and fu.user_id = u.id
     and u.state = 'ACTIVE_REMINDER_SENT'
     and u.reminder_sent_at < current_date - interval '7 weeks'`
  )
}

const updateReminderSentDate = async () => {
  await BaseModel.knex().raw(
    `update users
     set reminder_sent_at = '${new Date().toISOString()}'
     where id in (
     select distinct(u.id) from users u, farms_users fu
     where u.is_verified = true
     and fu.user_id = u.id
     and u.state = 'ACTIVE_REMINDER_SENT'
     and u.reminder_sent_at < current_date - interval '7 weeks'
     )`
  )
}

export default (app) => {
  app.jobs.schedule(6, JOB_NAME, EVERY_MONDAY_AT_5, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)

    try {
      app.info(`creating email campaign`)
      const { id } = await app.service('/admin/email-campaigns').create({
        name: `Second Login Reminders ${prettyTimestamp()}`,
        template: 'second_login_reminder',
        status: 'SENT',
      })
      await addEmailMessagesToQueue(id)
      app.info(`email campaign with id ${id} sent`)

      app.info('updating user states')
      await updateReminderSentDate()
    } catch (e) {
      app.error(e)
    }

    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
