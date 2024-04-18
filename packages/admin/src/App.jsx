import { Admin, Resource, Title } from 'react-admin'
import feathersClient from './feathersClient'
import { restClient } from 'ra-data-feathers'
import { jwtDecode } from 'jwt-decode'

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
import { hasAdminRole, hasSuperAdminRole } from './authorization'
import Layout from './components/Layout'
import {
  EmailCampaignsCreate,
  EmailCampaignsEdit,
  EmailCampaignsList
} from './resources/emailCampaigns'
import { EmailMessagesEdit, EmailMessagesList } from './resources/emailMessages'
import { useEffect, useState } from 'react'
import { JobsList } from './resources/jobs'
import BouncesList from './resources/bounces'

const restClientOptions = {
  usePatch: true
}

const authProvider = {
  login: (params) =>
    feathersClient.authenticate({
      strategy: 'local',
      email: params.username,
      password: params.password
    }),
  logout: () => feathersClient.logout(),
  checkAuth: () => {
    return (
      feathersClient
        .authenticate()
        // eslint-disable-next-line prefer-promise-reject-errors
        .catch(() => Promise.reject({ redirectTo: '/login' }))
    )
  },
  checkError: () => Promise.resolve(),
  getPermissions() {
    const accessToken = localStorage.getItem('feathers-jwt')
    const decodedToken = jwtDecode(accessToken)
    const roles = decodedToken.roles.map((r) => r.name)
    return roles
      ? Promise.resolve(roles)
      : Promise.reject(new Error('no permissions found'))
  }
}

export const useStatus = () => {
  const [apiStatus, setApiStatus] = useState({
    status: 'UNKNOWN',
    features: {}
  })

  useEffect(() => {
    const fetchApiStatus = async () => {
      const status = await feathersClient.service('status').find()
      setApiStatus(status)
    }
    fetchApiStatus()
  }, [])
  return apiStatus
}

const App = () => {
  return (
    <Admin
      dataProvider={restClient(feathersClient, restClientOptions)}
      authProvider={authProvider}
      theme={theme}
      dashboard={Dashboard}
      layout={Layout}
    >
      {(roles) => {
        return [
          <Title key='title' title='Ernte Teilen - ' />,
          hasAdminRole(roles) && (
            <Resource
              key='admin/entries'
              name='admin/entries'
              options={{ label: 'Entries' }}
            />
          ),
          hasAdminRole(roles) && (
            <Resource
              key='admin/farms'
              name='admin/farms'
              options={{ label: 'Farms' }}
              list={FarmsList}
              edit={FarmsEdit}
            />
          ),
          hasAdminRole(roles) && (
            <Resource
              key='admin/depots'
              name='admin/depots'
              options={{ label: 'Depots' }}
              list={DepotsList}
              edit={DepotsEdit}
            />
          ),
          hasAdminRole(roles) && (
            <Resource
              key='admin/initiatives'
              name='admin/initiatives'
              options={{ label: 'Initiatives' }}
              list={InitiativesList}
              edit={InitiativesEdit}
            />
          ),
          hasAdminRole(roles) && (
            <Resource
              key='admin/users'
              name='admin/users'
              options={{ label: 'Users' }}
              list={UsersList}
              edit={UsersEdit}
            />
          ),
          hasAdminRole(roles) && (
            <Resource
              key='admin/bounces'
              name='admin/bounces'
              options={{ label: 'Bounces' }}
              list={BouncesList}
            />
          ),
          hasAdminRole(roles) && (
            <Resource
              key='admin/stats'
              name='admin/stats'
              options={{ label: 'Stats' }}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/badges'
              name='admin/badges'
              options={{ label: 'Badges' }}
              list={BadgesList}
              edit={BadgesEdit}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/goals'
              name='admin/goals'
              options={{ label: 'Goals' }}
              list={GoalsList}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/products'
              name='admin/products'
              options={{ label: 'Products' }}
              list={ProductsList}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/roles'
              name='admin/roles'
              options={{ label: 'Roles' }}
              list={RolesList}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/jobs'
              name='admin/jobs'
              options={{ label: 'Jobs' }}
              list={JobsList}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/email-campaigns'
              name='admin/email-campaigns'
              options={{ label: 'Email Campaigns' }}
              list={EmailCampaignsList}
              edit={EmailCampaignsEdit}
              create={EmailCampaignsCreate}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/email-messages'
              name='admin/email-messages'
              options={{ label: 'Email Messages' }}
              list={EmailMessagesList}
              edit={EmailMessagesEdit}
            />
          ),
          hasSuperAdminRole(roles) && (
            <Resource
              key='admin/user-reactivation'
              name='admin/user-reactivation'
            />
          )
        ]
      }}
    </Admin>
  )
}

export default App
