import emails from './services/emails'

export default app => {
  app.configure(emails)
}
