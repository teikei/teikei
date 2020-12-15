import React from 'react'
import { Router, Switch, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import MapContainer from './containers/Map'
import EntryForm from './containers/EntryForm'
import MyEntriesList from './containers/MyEntries'
import DeletePlace from './containers/DeletePlace'
import UserAccount from './containers/UserAccount/UserAccountContainer'
import UserPassword from './containers/UserChangePassword'
import UserOnboarding from './containers/UserOnboarding'
import RecoverPassword from './containers/UserRecoverPassword'
import ResetPassword from './containers/UserResetPassword/index'
import Layout from './Layout'

export const MAP = '/'
export const INFO = '/info'
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
export const RECOVER_PASSWORD = './users/recoverpassword'
export const RESET_PASSWORD = './users/resetpassword'
export const MY_ENTRIES = '/myentries'

export const history = createBrowserHistory()

export const getDetailsPath = (item) => {
  if (item.type === 'Feature') {
    const {
      properties: { id, type },
    } = item
    return `${type.toLowerCase()}s/${id}`
  }
  if (item.type === 'location') {
    return `locations/${item.id}`
  }
  const { id, type } = item
  return `${type}s/${id}`
}
export const getEditPath = (place) => `${getDetailsPath(place)}/edit`
export const getDeletePath = (place) => `${getDetailsPath(place)}/delete`

// TODO what is this for?
export const getMapPositionPath = ({ lat, lon, type, id }) =>
  id ? `/${type.toLowerCase()}s/${id}` : `/position/${lat},${lon}`

const AppRouter = () => (
  <Router history={history}>
    <Layout>
      <Switch>
        <Route path={NEW_DEPOT}>
          <EntryForm type="depot" mode="create" />
        </Route>
        <Route path={NEW_FARM}>
          <EntryForm type="farm" mode="create" />
        </Route>
        <Route path={NEW_INITIATIVE}>
          <EntryForm type="initiative" mode="create" />
        </Route>
        <Route path={EDIT_DEPOT}>
          <EntryForm type="depot" mode="update" />
        </Route>
        <Route path={EDIT_FARM}>
          <EntryForm type="farm" mode="update" />
        </Route>
        <Route path={EDIT_INITIATIVE}>
          <EntryForm type="initiative" mode="update" />
        </Route>
        <Route path={DELETE_DEPOT}>
          <DeletePlace />
        </Route>
        <Route path={DELETE_FARM}>
          <DeletePlace />
        </Route>
        <Route path={DELETE_INITIATIVE}>
          <DeletePlace />
        </Route>
        <Route path={SIGN_IN}>
          <UserOnboarding />
        </Route>
        <Route path={SIGN_UP}>
          <UserOnboarding signUp />
        </Route>
        <Route path={EDIT_USER_ACCOUNT}>
          <UserAccount />
        </Route>
        <Route path={EDIT_USER_PASSWORD}>
          <UserPassword />
        </Route>
        <Route path={RECOVER_PASSWORD}>
          <RecoverPassword />
        </Route>
        <Route path={RESET_PASSWORD}>
          <ResetPassword />
        </Route>
        <Route path={MY_ENTRIES}>
          <MyEntriesList />
        </Route>
        <Route path={MAP}>
          <MapContainer mode="map" />
        </Route>
        <Route path={SHOW_POSITION}>
          <MapContainer mode="position" />
        </Route>
        <Route path={SHOW_PLACE}>
          <MapContainer mode="place" />
        </Route>
        <Route path={INFO}>
          <MapContainer mode="map" />
        </Route>
        {/*TODO*/}
        {/*<Route*/}
        {/*  path="/error"*/}
        {/*  onEnter={() => {*/}
        {/*    throw new Error('This is an Error')*/}
        {/*  }}*/}
        {/*/>*/}
      </Switch>
    </Layout>
  </Router>
)

export default AppRouter
