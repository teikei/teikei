import { Admin, CustomRoutes, Resource, Title } from 'react-admin'
import feathersClient from './feathersClient'
import { restClient } from 'ra-data-feathers'
import decodeJwt from 'jwt-decode'

import { FarmsList, FarmsEdit } from './resources/farms'
import { InitiativesEdit, InitiativesList } from './resources/initiatives'
import { DepotsList, DepotsEdit } from './resources/depots'
import { GoalsList } from './resources/goals'
import { BadgesEdit, BadgesList } from './resources/badges'
import UsersList, { UsersEdit } from './resources/users'
import { ProductsList } from './resources/products'
import theme from './theme'
import { RolesList } from './resources/roles'
import Dashboard from './components/Dashboard'
import { hasAdminRole } from './authorization'
import Layout from './components/Layout'
import customRoutes from './customRoutes'

const restClientOptions = {
  usePatch: true,
}

const authProvider = {
  login: (params) =>
    feathersClient.authenticate({
      strategy: 'local',
      email: params.username,
      password: params.password,
    }),
  logout: () => feathersClient.logout().then(() => Promise.resolve()),
  checkAuth: () =>
    feathersClient
      .authenticate()
      .then(({ accessToken }) => {
        const decodedToken = decodeJwt(accessToken)
        localStorage.setItem(
          'react_admin_roles',
          decodedToken.roles.map((r) => r.name)
        )
        return Promise.resolve()
      })
      // eslint-disable-next-line prefer-promise-reject-errors
      .catch(() => Promise.reject({ redirectTo: '/login' })),
  checkError: () => Promise.resolve(),
  getPermissions() {
    const role = localStorage.getItem('react_admin_roles')
    return role
      ? Promise.resolve(role)
      : Promise.reject(new Error('no permissions found'))
  },
}

const App = () => (
  <Admin
    dataProvider={restClient(feathersClient, restClientOptions)}
    authProvider={authProvider}
    theme={theme}
    dashboard={Dashboard}
    layout={Layout}
  >
    <CustomRoutes>{customRoutes}</CustomRoutes>
    {(roles) => {
      return [
        <Title key="title" title="Ernte Teilen - " />,
        hasAdminRole(roles) && (
          <Resource
            key="admin/farms"
            name="admin/farms"
            options={{ label: 'Farms' }}
            list={FarmsList}
            edit={FarmsEdit}
          />
        ),
        hasAdminRole(roles) && (
          <Resource
            key="admin/depots"
            name="admin/depots"
            options={{ label: 'Depots' }}
            list={DepotsList}
            edit={DepotsEdit}
          />
        ),
        hasAdminRole(roles) && (
          <Resource
            key="admin/initiatives"
            name="admin/initiatives"
            options={{ label: 'Initiatives' }}
            list={InitiativesList}
            edit={InitiativesEdit}
          />
        ),
        hasAdminRole(roles) && (
          <Resource
            key="admin/users"
            name="admin/users"
            options={{ label: 'Users' }}
            list={UsersList}
            edit={UsersEdit}
          />
        ),
        hasAdminRole(roles) && (
          <Resource
            key="admin/badges"
            name="admin/badges"
            options={{ label: 'Badges' }}
            list={BadgesList}
            edit={BadgesEdit}
          />
        ),
        hasAdminRole(roles) && (
          <Resource
            key="admin/goals"
            name="admin/goals"
            options={{ label: 'Goals' }}
            list={GoalsList}
          />
        ),
        hasAdminRole(roles) && (
          <Resource
            key="admin/products"
            name="admin/products"
            options={{ label: 'Products' }}
            list={ProductsList}
          />
        ),
        hasAdminRole(roles) && (
          <Resource
            key="admin/roles"
            name="admin/roles"
            options={{ label: 'Roles' }}
            list={RolesList}
          />
        ),
      ]
    }}
  </Admin>
)

export default App
