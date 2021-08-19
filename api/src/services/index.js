import authentication from './authentication'
import authManagement from './authManagement'

import emails from './emails'
import emailPreview from './emailPreview'
import entryContactMessage from './entryContactMessage'

import entries from './entries'
import depots from './depots'
import farms from './farms'
import initiatives from './initiatives'

import users from './users'
import products from './products'
import goals from './goals'
import badges from './badges'

import geocoder from './geocoder'
import reverseGeocoder from './reverseGeocoder'
import autocomplete from './autocomplete'
import searchIndex from './searchIndex'

import adminEntries from './admin/entries'
import adminFarms from './admin/farms'
import adminDepots from './admin/depots'
import adminInitiatives from './admin/initiatives'
import adminGoals from './admin/goals'
import adminUsers from './admin/users'
import adminProducts from './admin/products'
import adminBadges from './admin/badges'
import adminRoles from './admin/roles'
import adminAudit from './admin/audit'
import adminJobs from './admin/jobs'

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
  app.configure(products)
  app.configure(goals)
  app.configure(badges)
  app.configure(searchIndex)
  app.configure(adminFarms)
  app.configure(adminEntries)
  app.configure(adminDepots)
  app.configure(adminInitiatives)
  app.configure(adminGoals)
  app.configure(adminUsers)
  app.configure(adminProducts)
  app.configure(adminBadges)
  app.configure(adminRoles)
  app.configure(adminAudit)
  app.configure(adminJobs)
  if (app.isDevelopment()) {
    app.configure(emailPreview)
  }
}
