import BaseModel from '../models/base'

const deactivateUsers = async () => {
  await BaseModel.knex().raw(
    `update users
       set state = 'INACTIVE_NO_RESPONSE',
       reactivation_token = null
       where state = 'ACTIVE_SECOND_REMINDER_SENT'
       and reminder_sent_at <= current_date - interval '8 weeks'`
  )
}

const JOB_NAME = 'deactivate inactive users'
const EVERY_MONDAY_AT_6 = '0 18 * * 1'

export default (app) => {
  app.jobs.schedule(7, JOB_NAME, EVERY_MONDAY_AT_6, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)

    app.info('deactivating users')
    await deactivateUsers()

    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
