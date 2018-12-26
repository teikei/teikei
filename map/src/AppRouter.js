import React from 'react'
import PropTypes from 'prop-types'
import { Router, Route, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import MapContainer from './containers/Map/index'
import editor from './containers/EntryForm/index'
import MyEntriesList from './containers/MyEntries/index'
import DeletePlace from './containers/DeletePlace/index'
import UserAccount from './containers/UserAccount/UserAccountContainer'
import UserPassword from './containers/UserChangePassword/index'
import UserOnboarding from './containers/UserOnboarding/index'
import RecoverPassword from './containers/UserRecoverPassword/index'
import ResetPassword from './containers/UserResetPassword/index'
import Layout from './Layout'
import {
  requestAllPlaces,
  fetchMyEntries,
  showPosition,
  showInfo,
  showMap,
  setCountry
} from './containers/Map/duck'
import { showPlace, hidePlace } from './containers/Details/duck'
import { geocodeAndShowOnMap } from './containers/Search/duck'
import {
  initCreateFeature,
  initDeleteFeature,
  fetchProducts,
  fetchGoals,
  initEditFeature
} from './containers/EntryForm/duck'
import { confirmUser } from './containers/UserOnboarding/duck'
import { config } from './index'

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

export const history = useRouterHistory(createHashHistory)({
  basename: ''
})

export const getDetailsPath = item => {
  if (item.type === 'Feature') {
    const {
      properties: { id, type }
    } = item
    return `${type.toLowerCase()}s/${id}`
  }
  if (item.type === 'location') {
    return `locations/${item.id}`
  }
  const { id, type } = item
  return `${type}s/${id}`
}
export const getEditPath = place => `${getDetailsPath(place)}/edit`
export const getDeletePath = place => `${getDetailsPath(place)}/delete`

// TODO what is this for?
export const getMapPositionPath = ({ lat, lon, type, id }) =>
  id ? `/${type.toLowerCase()}s/${id}` : `/position/${lat},${lon}`

const appInit = dispatch => {
  dispatch(setCountry(config.country))
}

const AppRouter = ({ dispatch }) => (
  <Router history={history} onEnter={appInit(dispatch)}>
    <Route component={Layout}>
      <Route
        path={NEW_DEPOT}
        component={editor('depot', 'create')}
        onEnter={() => {
          dispatch(initCreateFeature())
          dispatch(requestAllPlaces()) // fetch data for farms select
        }}
      />
      <Route
        path={NEW_FARM}
        component={editor('farm', 'create')}
        onEnter={() => {
          dispatch(initCreateFeature())
          dispatch(fetchProducts())
        }}
      />
      <Route
        path={NEW_INITIATIVE}
        component={editor('initiative', 'create')}
        onEnter={() => {
          dispatch(initCreateFeature())
          dispatch(fetchGoals())
        }}
      />
      <Route
        path={EDIT_DEPOT}
        component={editor('depot', 'update')}
        onEnter={routerState => {
          dispatch(initEditFeature(routerState.params.id, 'depot'))
          dispatch(requestAllPlaces()) // fetch data for farms select
        }}
      />
      <Route
        path={EDIT_FARM}
        component={editor('farm', 'update')}
        onEnter={routerState => {
          dispatch(fetchProducts())
          dispatch(initEditFeature(routerState.params.id, 'farm'))
        }}
      />
      <Route
        path={EDIT_INITIATIVE}
        component={editor('initiative', 'update')}
        onEnter={routerState => {
          dispatch(initEditFeature(routerState.params.id, 'initiative'))
          dispatch(fetchGoals())
        }}
      />
      <Route
        path={DELETE_DEPOT}
        component={DeletePlace}
        onEnter={routerState =>
          dispatch(
            initDeleteFeature({ service: 'depots', id: routerState.params.id })
          )
        }
      />
      <Route
        path={DELETE_FARM}
        component={DeletePlace}
        onEnter={routerState =>
          dispatch(
            initDeleteFeature({ service: 'farms', id: routerState.params.id })
          )
        }
      />
      <Route
        path={DELETE_INITIATIVE}
        component={DeletePlace}
        onEnter={routerState =>
          dispatch(
            initDeleteFeature({
              service: 'initiatives',
              id: routerState.params.id
            })
          )
        }
      />
      <Route path={SIGN_IN} component={UserOnboarding} signUp={false} />
      <Route path={SIGN_UP} component={UserOnboarding} signUp />
      <Route path={EDIT_USER_ACCOUNT} component={UserAccount} />
      <Route path={EDIT_USER_PASSWORD} component={UserPassword} />
      <Route path={RECOVER_PASSWORD} component={RecoverPassword} />
      <Route
        path={RESET_PASSWORD}
        component={ResetPassword}
        onEnter={routerstate => {
          // reject routing request if no reset token is present
          if (!routerstate.location.query.reset_password_token) {
            history.push(MAP)
          }
        }}
      />
      <Route
        path={MY_ENTRIES}
        component={MyEntriesList}
        onEnter={() => dispatch(fetchMyEntries())}
      />

      <Route
        path={MAP}
        component={MapContainer}
        onEnter={routerstate => {
          dispatch(showMap())
          dispatch(hidePlace())
          dispatch(requestAllPlaces())
          if (routerstate.location.query.confirmation_token) {
            dispatch(confirmUser(routerstate.location.query.confirmation_token))
          }
        }}
      />
      <Route
        path={SHOW_POSITION}
        component={MapContainer}
        onEnter={({ params }) => {
          dispatch(hidePlace())
          dispatch(requestAllPlaces()) // fetch data for places
          dispatch(
            showPosition({
              latitude: params.latitude,
              longitude: params.longitude
            })
          )
        }}
      />
      <Route
        path={SHOW_PLACE}
        component={MapContainer}
        onEnter={({ params }) => {
          dispatch(requestAllPlaces()) // fetch data for places
          if (params.type === 'locations') {
            dispatch(geocodeAndShowOnMap(params.id))
          } else {
            dispatch(showPlace(params.type, params.id))
          }
        }}
      />
      <Route
        path={INFO}
        component={MapContainer}
        onEnter={() => {
          dispatch(hidePlace())
          dispatch(showInfo())
        }}
      />
      <Route
        path="/error"
        onEnter={() => {
          throw new Error('This is an Error')
        }}
      />
    </Route>
  </Router>
)

AppRouter.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default AppRouter
