import authentication from './authentication'
import authManagement from './authManagement'
import autocomplete from './autocomplete'
import depots from './depots'
import emails from './emails'
import emailPreview from './emailPreview'
import schemas from './schemas'
import entries from './entries'
import entryContactMessage from './entryContactMessage'
import farms from './farms'
import geocoder from './geocoder'
import initiatives from './initiatives'
import myEntries from './myEntries'
import users from './users'

import adminFarms from './admin/farms'
import adminDepots from './admin/depots'
import adminInitiatives from './admin/initiatives'
import adminGoals from './admin/goals'
import adminUsers from './admin/users'

export default app => {
  app.configure(authentication)
  app.configure(authManagement)
  app.configure(autocomplete)
  app.configure(depots)
  app.configure(emails)
  app.configure(entries)
  app.configure(entryContactMessage)
  app.configure(farms)
  app.configure(geocoder)
  app.configure(initiatives)
  app.configure(myEntries)
  app.configure(users)
  if (app.isDevelopment()) {
    app.configure(emailPreview)
    app.configure(schemas)
  }

  app.configure(adminFarms)
  app.configure(adminDepots)
  app.configure(adminInitiatives)
  app.configure(adminGoals)
  app.configure(adminUsers)
}
