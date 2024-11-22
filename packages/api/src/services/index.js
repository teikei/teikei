import adminAudit from './admin/audit'
import adminBadges from './admin/badges'
import adminBounces from './admin/bounces'
import adminDepots from './admin/depots'
import adminEmailCampaigns from './admin/emailCampaigns'
import adminEmailMessages from './admin/emailMessages'
import adminEntries from './admin/entries'
import adminFarms from './admin/farms'
import adminGoals from './admin/goals'
import adminInitiatives from './admin/initiatives'
import adminJobs from './admin/jobs'
import adminProducts from './admin/products'
import adminRoles from './admin/roles'
import adminStats from './admin/stats'
import userAccountStateChange from './admin/userAccountStateChange'
import adminUsers from './admin/users'
import authentication from './authentication'
import authManagement from './authManagement'
import autocomplete from './autocomplete'
import badges from './badges'
import depots from './depots'
import emailPreview from './emailPreview'
import emails from './emails'
import entries from './entries'
import entryContactMessage from './entryContactMessage'
import farms from './farms'
import geocoder from './geocoder'
import goals from './goals'
import initiatives from './initiatives'
import products from './products'
import reverseGeocoder from './reverseGeocoder'
import searchIndex from './searchIndex'
import status from './status'
import userReactivation from './userReactivation'
import users from './users'

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
