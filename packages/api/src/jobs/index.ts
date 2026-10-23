import type { Application } from '@feathersjs/feathers'
import schedule from 'node-schedule'
import type { JobEntry } from '../declarations.ts'
import { logger } from '../logger.ts'
import createLoginReminders from './createLoginReminders.ts'
import createSecondLoginReminders from './createSecondLoginReminders.ts'
import flagInactiveUsers from './flagInactiveUsers.ts'
import importEmailBounces from './importEmailBounces.ts'
import refreshSearchIndex from './refreshSearchIndex.ts'
import sendAuditEmail from './sendAuditEmail.ts'
import sendEmailCampaignMessages from './sendEmailCampaignMessages.ts'

export default (app: Application) => {
  app.jobs = Object.assign([] as JobEntry[], {
    schedule: (
      id: number,
      name: string,
      cron: string,
      callback: () => Promise<void>
    ) => {
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
  })

  app.configure(refreshSearchIndex)
  app.configure(sendEmailCampaignMessages)
  app.configure(sendAuditEmail)
  app.configure(createLoginReminders)
  app.configure(createSecondLoginReminders)
  app.configure(flagInactiveUsers)
  app.configure(importEmailBounces)
}
