import adminAudit from './admin/audit.js'
import adminBadges from './admin/badges.js'
import adminBounces from './admin/bounces.js'
import adminDepots from './admin/depots.js'
import adminEmailCampaigns from './admin/emailCampaigns.js'
import adminEmailMessages from './admin/emailMessages.js'
import adminEntries from './admin/entries.js'
import adminFarms from './admin/farms.js'
import adminGoals from './admin/goals.js'
import adminInitiatives from './admin/initiatives.js'
import adminJobs from './admin/jobs.js'
import adminOrigins from './admin/origins.js'
import adminProducts from './admin/products.js'
import adminRoles from './admin/roles.js'
import adminStats from './admin/stats.js'
import userAccountStateChange from './admin/userAccountStateChange.js'
import adminUsers from './admin/users.js'
import authentication from './authentication.js'
import authManagement from './authManagement.js'
import autocomplete from './autocomplete.js'
import badges from './badges.js'
import depots from './depots.js'
import emailPreview from './emailPreview.js'
import emails from './emails.js'
import entries from './entries.js'
import entryContactMessage from './entryContactMessage.js'
import farms from './farms.js'
import geocoder from './geocoder.js'
import goals from './goals.js'
import initiatives from './initiatives.js'
import products from './products.js'
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
