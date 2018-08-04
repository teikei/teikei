import CustomDashboard from './custom/Dashboard'
import auth from './auth'

import farms from './views/farms'
import depots from './views/depots'
import initiatives from './views/initiatives'
import goals from './views/goals'
import users from './views/users'

const OPTIONS = {
  debug: false,
  basePath: '/',
  baseURL: 'http://localhost:3030'
}

const admin = {}
admin.title = 'Teikei'
admin.options = OPTIONS
// admin.views = { users, sections, categories, tags, entries }
admin.views = { farms, depots, initiatives, goals, users }
admin.auth = auth
admin.custom = { dashboard: CustomDashboard }
admin.id = 'teikei'
admin.messages = {
  'login.button': 'Sign in',
  'logout.button': 'Sign out',
  'logout.affirmation': 'Have a nice day!',
  pageNotFound: 'Sorry, page not found.'
}

export default admin
