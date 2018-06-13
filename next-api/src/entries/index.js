import entries from './services/entries'
import myEntries from './services/myEntries'
import depots from './services/depots'
import farms from './services/farms'
import initiatives from './services/initiatives'

export default app => {
  app.configure(entries)
  app.configure(myEntries)
  app.configure(depots)
  app.configure(farms)
  app.configure(initiatives)
}
