import schedule from 'node-schedule'

import refreshSearchIndex from './refreshSearchIndex'
import reverseGeocode from './reverseGeocode'
import sendAuditEmail from './sendAuditEmail'
import sendEmailCampaignMessages from './sendEmailCampaignMessages'
import createLoginReminders from './createLoginReminders'
import deactivateInactiveUsers from './deactivateInactiveUsers'
// import importEmailBounces from './importEmailBounces'
import createSecondLoginReminders from './createSecondLoginReminders'

export default (app) => {
  app.jobs = []
  app.jobs.schedule = (id, name, cron, callback) => {
    const job = schedule.scheduleJob(name, cron, callback)
    app.info(`registering job ${name}`)
    app.jobs[id] = { id, cron, job }
  }

  app.configure(refreshSearchIndex) // 1
  app.configure(reverseGeocode) // 2
  app.configure(sendEmailCampaignMessages) // 3
  app.configure(sendAuditEmail) // 4
  app.configure(createLoginReminders) // 5
  app.configure(createSecondLoginReminders) // 6
  app.configure(deactivateInactiveUsers) // 7
  // app.configure(importEmailBounces)
}
