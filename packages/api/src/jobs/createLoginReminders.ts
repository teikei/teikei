import type { Application } from '@feathersjs/feathers'
import { createEmailCampaignsDomain } from '../domain/emailCampaigns.ts'
import { logger } from '../logger.ts'

const JOB_NAME = 'create login reminders'
const SCHEDULE_EVERY_QUARTER = '0 16 1 3,6,9,12 *'

export default (app: Application) => {
  const campaigns = createEmailCampaignsDomain(app.get('kysely'))

  app.jobs.schedule(5, JOB_NAME, SCHEDULE_EVERY_QUARTER, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    try {
      const { campaignId, messageCount } = await campaigns.startLoginReminders()
      logger.info(
        `email campaign with id ${campaignId} prepared and ${messageCount} messages queued`
      )
    } catch (e) {
      logger.error(e)
    }
    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
