import adminAudit from './admin/audit.js'
import adminBadges from './admin/badges.ts'
import adminBounces from './admin/bounces.js'
import adminDepots from './admin/depots.ts'
import adminEmailCampaigns from './admin/emailCampaigns.js'
import adminEmailMessages from './admin/emailMessages.js'
import adminEntries from './admin/entries.ts'
import adminFarms from './admin/farms.ts'
import adminGoals from './admin/goals.ts'
import adminInitiatives from './admin/initiatives.ts'
import adminJobs from './admin/jobs.js'
import adminOrigins from './admin/origins.ts'
import adminProducts from './admin/products.ts'
import adminRoles from './admin/roles.ts'
import adminStats from './admin/stats.js'
import userAccountStateChange from './admin/userAccountStateChange.js'
import adminUsers from './admin/users.js'
import authentication from './authentication.js'
import authManagement from './authManagement.js'
import autocomplete from './autocomplete.js'
import badges from './badges.ts'
import depots from './depots.ts'
import emailPreview from './emailPreview.js'
import emails from './emails.js'
import entries from './entries.ts'
import entryContactMessage from './entryContactMessage.js'
import farms from './farms.ts'
import geocoder from './geocoder.js'
import goals from './goals.ts'
import initiatives from './initiatives.ts'
import products from './products.ts'
import reverseGeocoder from './reverseGeocoder.js'
import searchIndex from './searchIndex.js'
import status from './status.js'
import userReactivation from './userReactivation.js'
import users from './users.js'

export default (app) => {
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
