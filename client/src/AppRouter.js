import React, { PropTypes } from 'react'
import { Router, Route, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import MapContainer from './map/MapContainer'
import editor from './editors/editorContainerCreator'
import MyEntriesList from './myentries/MyEntriesListContainer'
import DeletePlace from './myentries/DeletePlaceContainer'
import UserAccount from './user/UserAccountContainer'
import UserOnboarding from './user/UserOnboardingContainer'
import RecoverPassword from './user/RecoverPasswordContainer'
import ResetPassword from './user/ResetPasswordContainer'
import Layout from './Layout'
import {
  requestAllPlaces,
  fetchMyPlaces,
  showPosition,
  showInfo,
  showMap,
  setCountry
} from './map/mapActions'
import { showPlace, hidePlace } from './details/detailsActions'
import { geocodeAndShowOnMap } from './search/searchActions'
import {
  initCreatePlace,
  initUpdateDepot,
  initUpdateFarm,
  initDeletePlace,
  initUpdateInitiative
} from './editors/editorActions'
import { obtainLoginState, confirmUser } from './user/userActions'
import config from './configuration'

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
export const DELETE_PLACE = '/places/:id/delete'
export const SIGN_IN = '/users/sign-in'
export const SIGN_UP = '/users/sign-up'
export const EDIT_USER_ACCOUNT = '/users/edit'
export const RECOVER_PASSWORD = './users/recoverpassword'
export const RESET_PASSWORD = './users/resetpassword'
export const MY_ENTRIES = '/myentries'

export const history = useRouterHistory(createHashHistory)({
  basename: ''
})

export const getDetailsPath = place => {
  if (place && place.type) {
    return `${place.type.toLowerCase()}s/${place.id}`
  }
  return ''
}
export const getEditPath = place => `${getDetailsPath(place)}/edit`
export const getDeletePath = place => `/places/${place.id}/delete`
export const getMapPositionPath = ({ lat, lon, type, id }) =>
  id ? `/${type.toLowerCase()}s/${id}` : `/position/${lat},${lon}`

const appInit = dispatch => {
  dispatch(obtainLoginState())
  dispatch(setCountry(config.country))
}

const AppRouter = ({ dispatch }) => (
  <Router history={history} onEnter={appInit(dispatch)}>
    <Route component={Layout}>
      <Route
        path={NEW_DEPOT}
        component={editor('depot', 'create')}
        onEnter={() => {
          dispatch(initCreatePlace())
          dispatch(requestAllPlaces()) // fetch data for places select
        }}
      />
      <Route
        path={NEW_FARM}
        component={editor('farm', 'create')}
        onEnter={() => dispatch(initCreatePlace())}
      />
      <Route
        path={NEW_INITIATIVE}
        component={editor('initiative', 'create')}
        onEnter={() => dispatch(initCreatePlace())}
      />
      <Route
        path={EDIT_DEPOT}
        component={editor('depot', 'update')}
        onEnter={routerState => {
          dispatch(initUpdateDepot(routerState.params.id))
          dispatch(requestAllPlaces()) // fetch data for places select
        }}
      />
      <Route
        path={EDIT_FARM}
        component={editor('farm', 'update')}
        onEnter={routerState => dispatch(initUpdateFarm(routerState.params.id))}
      />
      <Route
        path={EDIT_INITIATIVE}
        component={editor('initiative', 'update')}
        onEnter={routerState =>
          dispatch(initUpdateInitiative(routerState.params.id))
        }
      />
      <Route
        path={DELETE_PLACE}
        component={DeletePlace}
        onEnter={routerState =>
          dispatch(initDeletePlace(routerState.params.id))
        }
      />
      <Route path={SIGN_IN} component={UserOnboarding} signUp={false} />
      <Route path={SIGN_UP} component={UserOnboarding} signUp />
      <Route path={EDIT_USER_ACCOUNT} component={UserAccount} />
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
        onEnter={() => dispatch(fetchMyPlaces())}
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
            showPosition({ lat: Number(params.lat), lon: Number(params.lon) })
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
        path={'/error'}
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

AppRouter.defaultProps = {
  onAppInit: null
}

export default AppRouter
