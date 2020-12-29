import CustomDashboard from './custom/Dashboard'
import auth from './auth'

import farms from './views/farms'
import depots from './views/depots'
import initiatives from './views/initiatives'
import goals from './views/goals'
import badges from './views/badges'
import users from './views/users'
import products from './views/products'
import jobs from './views/jobs'

const admin = {
  title: 'Teikei',
  views: { farms, depots, initiatives, goals, badges, users, products, jobs },
  auth,
  custom: { dashboard: CustomDashboard },
  options: {
    debug: false,
  },
  messages: {
    'login.button': 'Sign in',
    'logout.button': 'Sign out',
    'logout.affirmation': 'You are logged out.',
    pageNotFound: 'Sorry, page not found.',
  },
  id: 'teikei', // TODO use id per instance, eg teikei-staging / teikei-prod ?
}

export default admin
