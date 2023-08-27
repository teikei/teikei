import BaseModel from '../models/base'

const JOB_NAME = 'create login reminders'
const SCHEDULE_EVERY_QUARTER = '0 5 1 3,6,9,12 *'

const addEmailMessagesToQueue = async (id) => {
  await BaseModel.knex().raw(
    `insert into email_messages (user_id, campaign_id)
     select id, ${id} from users
     where is_verified = true
     and state in ('ACTIVE', 'ACTIVE_REMINDER_SENT')
     and last_login < current_date - interval '1 year'`
  )
}

const updateUserStates = async () => {
  await BaseModel.knex().raw(
    `update users
     set state = 'ACTIVE_REMINDER_SENT',
     reminder_sent_at = ${new Date().toISOString()}
     where is_verified = true
     and state = 'ACTIVE'
     and last_login < current_date - interval '1 year'`
  )
}

export default (app) => {
  app.jobs.schedule(6, JOB_NAME, SCHEDULE_EVERY_QUARTER, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)

    try {
      app.info(`creating email campaign`)
      const { id } = await app.service('/admin/email-campaigns').create({
        name: `Login Reminders ${new Date().toISOString()}`,
        template: 'login_reminder',
        status: 'SENT',
      })
      await addEmailMessagesToQueue(id)
      app.info(`email campaign with id ${id} sent`)

      app.info('updating user states')
      await updateUserStates()
    } catch (e) {
      app.error(e)
    }

    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
