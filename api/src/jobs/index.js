import schedule from 'node-schedule'

import refreshSearchIndex from './refreshSearchIndex'
import reverseGeocode from './reverseGeocode'
import sendAuditEmail from './sendAuditEmail'

export default (app) => {
  app.jobs = []
  app.jobs.schedule = (name, cron, callback) => {
    const job = schedule.scheduleJob(name, cron, callback)
    app.info(`registering job ${name}`)
    app.jobs.push({ name: job.name, cron })
  }
  app.configure(refreshSearchIndex)
  app.configure(reverseGeocode)
  app.configure(sendAuditEmail)
}
