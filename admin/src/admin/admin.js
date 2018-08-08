import CustomDashboard from './custom/Dashboard'
import auth from './auth'

import farms from './views/farms'
import depots from './views/depots'
import initiatives from './views/initiatives'
import goals from './views/goals'
import users from './views/users'
import products from './views/products'

const options = {
  debug: false
}

const admin = {
  title: 'Teikei',
  options,
  views: { farms, depots, initiatives, goals, users, products },
  auth,
  custom: { dashboard: CustomDashboard },
  id: 'teikei',
  messages: {
    'login.button': 'Sign in',
    'logout.button': 'Sign out',
    'logout.affirmation': 'You are logged out.',
    pageNotFound: 'Sorry, page not found.'
  }
}

export default admin
