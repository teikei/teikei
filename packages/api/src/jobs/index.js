import schedule from 'node-schedule'
import { logger } from '../logger'
import createLoginReminders from './createLoginReminders'
import createSecondLoginReminders from './createSecondLoginReminders'
import flagInactiveUsers from './flagInactiveUsers'
import importEmailBounces from './importEmailBounces'
import refreshSearchIndex from './refreshSearchIndex'
import reverseGeocode from './reverseGeocode'
import sendAuditEmail from './sendAuditEmail'
import sendEmailCampaignMessages from './sendEmailCampaignMessages'

export default (app) => {
  app.jobs = []
  app.jobs.schedule = (id, name, cron, callback) => {
    const job = schedule.scheduleJob(name, cron, callback)
    logger.info(`registering job ${name}`)
    app.jobs[id] = { id, cron, job }
  }

  app.configure(refreshSearchIndex)
  app.configure(reverseGeocode)
  app.configure(sendEmailCampaignMessages)
  app.configure(sendAuditEmail)
  app.configure(createLoginReminders)
  app.configure(createSecondLoginReminders)
  app.configure(flagInactiveUsers)
  app.configure(importEmailBounces)
}
