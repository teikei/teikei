import React from 'react'
import { Router, Route } from 'react-router'
import browserHistory from './browserHistory'
import MapContainer from './map/MapContainer'
import DepotDetails from './details/DepotDetails'
import FarmDetails from './details/FarmDetails'
import DepotEditor from './editors/DepotEditorContainer'
import FarmEditor from './editors/FarmEditorContainer'
import MyEntriesList from './myentries/MyEntriesListContainer'
import SignIn from './user/SignInContainer'
import Layout from './Layout'
import { fetchAllPlaces } from './map/mapActions'
import { newDepot, newFarm, editDepot, editFarm } from './editors/editorActions'

export const ROOT = '/'
export const MAP = '/new'
export const NEW_DEPOT = '/new/depots/new'
export const NEW_FARM = '/new/farms/new'
export const EDIT_DEPOT = '/new/depots/:id/edit'
export const EDIT_FARM = '/new/farms/:id/edit'
export const DEPOT_DETAILS = '/new/depots/:id'
export const FARM_DETAILS = '/new/farms/:id'
export const SIGN_IN = '/new/users/sign_in'
export const MY_ENTRIES = '/new/myentries'

const dynamicRoute = (place, verb) => `/new/${place.type.toLowerCase()}/${place.id}/${verb}`

export const getEditRoute = p => dynamicRoute(p, 'edit')
export const getDeleteRoute = p => dynamicRoute(p, 'delete')

const AppRouter = ({ dispatch }) => (
  <Router history={browserHistory}>
    <Route path={ROOT} component={Layout} onEnter={() => dispatch(fetchAllPlaces())}>
      <Route path={MAP} component={MapContainer} />
      <Route path={NEW_DEPOT} component={DepotEditor} onEnter={() => dispatch(newDepot())} />
      <Route path={NEW_FARM} component={FarmEditor} onEnter={() => dispatch(newFarm())} />
      <Route path={EDIT_DEPOT} component={DepotEditor} onEnter={() => dispatch(editDepot())} />
      <Route path={EDIT_FARM} component={FarmEditor} onEnter={() => dispatch(editFarm())} />
      <Route path={DEPOT_DETAILS} component={DepotDetails} />
      <Route path={FARM_DETAILS} component={FarmDetails} />
      <Route path={SIGN_IN} component={SignIn} />
      <Route path={MY_ENTRIES} component={MyEntriesList} />
    </Route>
  </Router>
)

AppRouter.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
}

AppRouter.defaultProps = {
  onAppInit: null,
}

export default AppRouter
