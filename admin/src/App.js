import { Admin, Resource, Title } from 'react-admin'
import feathersClient from './feathersClient'
import { restClient } from 'ra-data-feathers'

import { FarmsList, FarmsEdit } from './resources/farms'
import { InitiativesEdit, InitiativesList } from './resources/initiatives'
import { DepotsList, DepotsEdit } from './resources/depots'
import { GoalsList } from './resources/goals'
import { BadgesEdit, BadgesList } from './resources/badges'
import UsersList, { UsersEdit } from './resources/users'
import { ProductsList } from './resources/products'
import theme from './theme'
import { RolesList } from './resources/roles'

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
      .then(() => Promise.resolve())
      // eslint-disable-next-line prefer-promise-reject-errors
      .catch(() => Promise.reject({ redirectTo: '/login' })),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve([]),
}

const App = () => (
  <Admin
    dataProvider={restClient(feathersClient, restClientOptions)}
    authProvider={authProvider}
    theme={theme}
  >
    <Title title="Ernte Teilen - " />
    <Resource
      name="admin/farms"
      options={{ label: 'Farms' }}
      list={FarmsList}
      edit={FarmsEdit}
    />
    <Resource
      name="admin/depots"
      options={{ label: 'Depots' }}
      list={DepotsList}
      edit={DepotsEdit}
    />
    <Resource
      name="admin/initiatives"
      options={{ label: 'Initiatives' }}
      list={InitiativesList}
      edit={InitiativesEdit}
    />
    <Resource
      name="admin/users"
      options={{ label: 'Users' }}
      list={UsersList}
      edit={UsersEdit}
    />
    <Resource
      name="admin/badges"
      options={{ label: 'Badges' }}
      list={BadgesList}
      edit={BadgesEdit}
    />
    <Resource
      name="admin/goals"
      options={{ label: 'Goals' }}
      list={GoalsList}
    />
    <Resource
      name="admin/products"
      options={{ label: 'Products' }}
      list={ProductsList}
    />

    <Resource
      name="admin/roles"
      options={{ label: 'Roles' }}
      list={RolesList}
    />
  </Admin>
)

export default App
