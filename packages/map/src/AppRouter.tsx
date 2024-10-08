import { Route, Redirect, Router, Switch, useLocation } from 'react-router-dom'
import { createHashHistory } from 'history'

import { Feature } from 'types/types'
import MapContainer from './containers/Map'
import MyEntriesList from './containers/MyEntries'
import DeletePlace from './containers/DeletePlace'
import UserAccount from './containers/UserAccount'
import UserChangePassword from './containers/UserChangePassword'
import UserOnboarding from './containers/UserOnboarding'
import UserRecoverPassword from './containers/UserRecoverPassword'
import ResetPassword from './containers/UserResetPassword/index'
import Layout from './Layout'
import { config } from './main'
import EditorDepot from './containers/Editors/EditorDepot'
import EditorFarm from './containers/Editors/EditorFarm'
import EditorInitiative from './containers/Editors/EditorInitiative'
import { useGlobalState } from './StateContext'
import { PropsWithChildren } from 'react'

export const MAP = '/'
export const SHOW_PLACE = '/:type/:id'
export const SHOW_POSITION = '/position/:lat,:lon'
export const NEW_DEPOT = '/depots/new'
export const NEW_FARM = '/farms/new'
export const NEW_INITIATIVE = '/initiatives/new'
export const EDIT_DEPOT = '/depots/:id/edit'
export const EDIT_FARM = '/farms/:id/edit'
export const EDIT_INITIATIVE = '/initiatives/:id/edit'
export const DELETE_DEPOT = '/depots/:id/delete'
export const DELETE_FARM = '/farms/:id/delete'
export const DELETE_INITIATIVE = '/initiatives/:id/delete'
export const SIGN_IN = '/users/sign-in'
export const SIGN_UP = '/users/sign-up'
export const EDIT_USER_ACCOUNT = '/users/editAccount'
export const EDIT_USER_PASSWORD = '/users/editPassword'
export const RECOVER_PASSWORD = '/users/recoverpassword'
export const RESET_PASSWORD = '/users/resetpassword'
export const MY_ENTRIES = '/myentries'

export const history = createHashHistory()

export const useQueryString = () => {
  return new URLSearchParams(useLocation().search)
}

export const getDetailsPath = (feature: Feature, withBaseUrl = true) => {
  const prefix = withBaseUrl ? config.baseUrl : ''
  if (feature.type === 'Feature') {
    const {
      properties: { id, type }
    } = feature
    return `${prefix}/${type.toLowerCase()}s/${id}`
  }
  if (feature.type === 'location') {
    return `${prefix}/locations/${feature.id}`
  }
  const { id, type } = feature
  return `${prefix}/${type}s/${id}`
}
export const getEditPath = (feature: Feature) =>
  `${getDetailsPath(feature, false)}/edit`
export const getDeletePath = (feature: Feature) =>
  `${getDetailsPath(feature, false)}/delete`

const ProtectedRoute = ({ children, ...rest }: PropsWithChildren) => {
  const { currentUser } = useGlobalState()
  return (
    <Route
      {...rest}
      render={(props) =>
        currentUser ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/users/sign-in',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  )
}

const AppRouter = () => (
  <div>
    <Router history={history}>
      <Layout>
        <Switch>
          <ProtectedRoute path={NEW_DEPOT} exact>
            <EditorDepot mode='create' />
          </ProtectedRoute>
          <ProtectedRoute path={NEW_FARM} exact>
            <EditorFarm mode='create' />
          </ProtectedRoute>
          <ProtectedRoute path={NEW_INITIATIVE} exact>
            <EditorInitiative mode='create' />
          </ProtectedRoute>
          <ProtectedRoute path={EDIT_DEPOT} exact>
            <EditorDepot mode='update' />
          </ProtectedRoute>
          <ProtectedRoute path={EDIT_FARM} exact>
            <EditorFarm mode='update' />
          </ProtectedRoute>
          <ProtectedRoute path={EDIT_INITIATIVE} exact>
            <EditorInitiative mode='update' />
          </ProtectedRoute>
          <ProtectedRoute path={DELETE_DEPOT} exact>
            <DeletePlace type='depots' />
          </ProtectedRoute>
          <ProtectedRoute path={DELETE_FARM} exact>
            <DeletePlace type='farms' />
          </ProtectedRoute>
          <ProtectedRoute path={DELETE_INITIATIVE} exact>
            <DeletePlace type='initiatives' />
          </ProtectedRoute>
          <Route path={SIGN_IN} exact>
            <UserOnboarding />
          </Route>
          <Route path={SIGN_UP} exact>
            <UserOnboarding signUp />
          </Route>
          <ProtectedRoute path={EDIT_USER_ACCOUNT} exact>
            <UserAccount />
          </ProtectedRoute>
          <ProtectedRoute path={EDIT_USER_PASSWORD} exact>
            <UserChangePassword />
          </ProtectedRoute>
          <Route path={RECOVER_PASSWORD} exact>
            <UserRecoverPassword />
          </Route>
          <Route path={RESET_PASSWORD} exact>
            <ResetPassword />
          </Route>
          <ProtectedRoute path={MY_ENTRIES} exact>
            <MyEntriesList />
          </ProtectedRoute>
          <Route path={SHOW_POSITION} exact>
            <MapContainer mode='position' />
          </Route>
          <Route path={SHOW_PLACE} exact>
            <MapContainer mode='place' />
          </Route>
          <Route path={MAP} exact>
            <MapContainer mode='map' />
          </Route>
        </Switch>
      </Layout>
    </Router>
  </div>
)

export default AppRouter
