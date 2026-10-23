import type { Application } from '@feathersjs/express'
import adminAudit from './admin/audit.ts'
import adminBadges from './admin/badges.ts'
import adminBounces from './admin/bounces.ts'
import adminDepots from './admin/depots.ts'
import adminEmailCampaigns from './admin/emailCampaigns.ts'
import adminEmailMessages from './admin/emailMessages.ts'
import adminEntries from './admin/entries.ts'
import adminFarms from './admin/farms.ts'
import adminGoals from './admin/goals.ts'
import adminInitiatives from './admin/initiatives.ts'
import adminJobs from './admin/jobs.ts'
import adminOrigins from './admin/origins.ts'
import adminProducts from './admin/products.ts'
import adminRoles from './admin/roles.ts'
import adminStats from './admin/stats.ts'
import userAccountStateChange from './admin/userAccountStateChange.ts'
import adminUsers from './admin/users.ts'
import authentication from './authentication.ts'
import authManagement from './authManagement.ts'
import autocomplete from './autocomplete.ts'
import badges from './badges.ts'
import depots from './depots.ts'
import emailPreview from './emailPreview.ts'
import emails from './emails.ts'
import entries from './entries.ts'
import entryContactMessage from './entryContactMessage.ts'
import farms from './farms.ts'
import geocoder from './geocoder.ts'
import goals from './goals.ts'
import initiatives from './initiatives.ts'
import products from './products.ts'
import reverseGeocoder from './reverseGeocoder.ts'
import searchIndex from './searchIndex.ts'
import status from './status.ts'
import userReactivation from './userReactivation.ts'
import users from './users.ts'

export default (app: Application) => {
  app.configure(authentication)
  app.configure(authManagement)
  app.configure(autocomplete)
  app.configure(depots)
  app.configure(emails)
  app.configure(entries)
  app.configure(entryContactMessage)
  app.configure(farms)
  app.configure(geocoder)
  app.configure(reverseGeocoder)
  app.configure(initiatives)
  app.configure(users)
  app.configure(userReactivation)
  app.configure(products)
  app.configure(goals)
  app.configure(badges)
  app.configure(searchIndex)
  app.configure(status)

  app.configure(adminFarms)
  app.configure(adminEntries)
  app.configure(adminDepots)
  app.configure(adminInitiatives)
  app.configure(adminGoals)
  app.configure(adminUsers)
  app.configure(adminProducts)
  app.configure(adminBadges)
  app.configure(adminRoles)
  app.configure(adminOrigins)
  app.configure(adminEmailCampaigns)
  app.configure(adminEmailMessages)
  app.configure(adminAudit)
  app.configure(adminJobs)
  app.configure(userAccountStateChange)
  app.configure(adminStats)
  app.configure(adminBounces)
  if (app.isDevelopment()) {
    app.configure(emailPreview)
  }
}
