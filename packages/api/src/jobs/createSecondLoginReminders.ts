import type { Application } from '@feathersjs/feathers'
import { createEmailCampaignsDomain } from '../domain/emailCampaigns.ts'
import { logger } from '../logger.ts'

const JOB_NAME = 'create second login reminders'
const EVERY_MONDAY_AT_5 = '0 17 * * 1'

export default (app: Application) => {
  const campaigns = createEmailCampaignsDomain(app.get('kysely'))

  app.jobs.schedule(6, JOB_NAME, EVERY_MONDAY_AT_5, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)

    try {
      const { campaignId, messageCount } =
        await campaigns.startSecondLoginReminders()
      logger.info(
        `email campaign with id ${campaignId} prepared and ${messageCount} messages queued`
      )
    } catch (e) {
      logger.error(e)
    }

    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
