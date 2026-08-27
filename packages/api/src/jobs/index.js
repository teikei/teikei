import schedule from 'node-schedule'
import { logger } from '../logger.js'
import createLoginReminders from './createLoginReminders.js'
import createSecondLoginReminders from './createSecondLoginReminders.js'
import flagInactiveUsers from './flagInactiveUsers.js'
import importEmailBounces from './importEmailBounces.js'
import refreshSearchIndex from './refreshSearchIndex.js'
import sendAuditEmail from './sendAuditEmail.js'
import sendEmailCampaignMessages from './sendEmailCampaignMessages.js'

export default (app) => {
  app.jobs = []
  app.jobs.schedule = (id, name, cron, callback) => {
    const runJob = async () => {
      try {
        await callback()
      } catch (error) {
        logger.error(`CRON: ${name} - failed`, { error })
      }
    }

    const job = schedule.scheduleJob(name, cron, runJob)
    logger.info(`registering job ${name}`)
    app.jobs[id] = { id, cron, job, run: callback }
  }

  app.configure(refreshSearchIndex)
  app.configure(sendEmailCampaignMessages)
  app.configure(sendAuditEmail)
  app.configure(createLoginReminders)
  app.configure(createSecondLoginReminders)
  app.configure(flagInactiveUsers)
  app.configure(importEmailBounces)
}
