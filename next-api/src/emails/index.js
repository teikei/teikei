import emails from './services/emails'
import entryContactMessage from './services/entryContactMessage'

export default app => {
  app.configure(emails)
  app.configure(entryContactMessage)
}
