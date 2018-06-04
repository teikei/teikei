import users from './services/users'
import authentication from './services/authentication'
import authManagement from './services/authManagement'

export default app => {
  app.configure(users)
  app.configure(authentication)
  app.configure(authManagement)
}
