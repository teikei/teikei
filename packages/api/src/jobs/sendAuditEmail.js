import { logger } from '../logger'

const JOB_NAME = 'send audit email'
const SCHEDULE_FRIDAY_AT_16 = '0 16 * * FRI'

export default (app) => {
  app.jobs.schedule(4, JOB_NAME, SCHEDULE_FRIDAY_AT_16, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    const mailerConfig = app.get('mailer')
    const recipients =
      mailerConfig.auditRecipients && mailerConfig.auditRecipients.split(',')

    logger.info(`recipients: ${JSON.stringify(recipients)}`)

    if (recipients) {
      await Promise.all(
        recipients.map(async (recipient) => {
          const report = await app.service('admin/audit').find()
          await app.service('emails').create({
            template: 'admin_audit',
            message: {
              to: recipient,
            },
            locals: {
              report,
            },
          })
        }),
      )
    } else {
      logger.info('CRON: no audit recipients specified, no audit email sent')
    }

    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
