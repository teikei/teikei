import authentication from './authentication'
import authManagement from './authManagement'
import autocomplete from './autocomplete'
import searchIndex from './jobs/buildSearchIndex'
import depots from './depots'
import emails from './emails'
import emailPreview from './emailPreview'
import schemas from './schemas'
import entries from './entries'
import entryContactMessage from './entryContactMessage'
import farms from './farms'
import geocoder from './geocoder'
import initiatives from './initiatives'
import users from './users'
import products from './products'
import goals from './goals'

import adminFarms from './admin/farms'
import adminDepots from './admin/depots'
import adminInitiatives from './admin/initiatives'
import adminGoals from './admin/goals'
import adminUsers from './admin/users'
import adminProducts from './admin/products'
import adminRoles from './admin/roles'

export default app => {
  app.configure(authentication)
  app.configure(authManagement)
  app.configure(autocomplete)
  app.configure(searchIndex)
  app.configure(depots)
  app.configure(emails)
  app.configure(entries)
  app.configure(entryContactMessage)
  app.configure(farms)
  app.configure(geocoder)
  app.configure(initiatives)
  app.configure(users)
  app.configure(products)
  app.configure(goals)
  if (app.isDevelopment()) {
    app.configure(emailPreview)
    app.configure(schemas)
  }

  app.configure(adminFarms)
  app.configure(adminDepots)
  app.configure(adminInitiatives)
  app.configure(adminGoals)
  app.configure(adminUsers)
  app.configure(adminProducts)
  app.configure(adminRoles)
}
