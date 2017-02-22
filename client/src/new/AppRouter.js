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

const AppRouter = ({ onAppInit }) => (
  <Router history={browserHistory}>
    <Route path={ROOT} component={Layout} onEnter={() => onAppInit()}>
      <Route path={MAP} component={MapContainer} />
      <Route path={NEW_DEPOT} component={DepotEditor} />
      <Route path={NEW_FARM} component={FarmEditor} />
      <Route path={EDIT_DEPOT} component={DepotEditor} />
      <Route path={EDIT_FARM} component={FarmEditor} />
      <Route path={DEPOT_DETAILS} component={DepotDetails} />
      <Route path={FARM_DETAILS} component={FarmDetails} />
      <Route path={SIGN_IN} component={SignIn} />
      <Route path={MY_ENTRIES} component={MyEntriesList} />
    </Route>
  </Router>
)

AppRouter.propTypes = {
  onAppInit: React.PropTypes.func,
}

AppRouter.defaultProps = {
  onAppInit: null,
}

export default AppRouter
