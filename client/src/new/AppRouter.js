import React from 'react'
import { Router, Route, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import MapContainer from './map/MapContainer'
import Details from './details/DetailsContainer'
import DepotEditor from './editors/DepotEditorContainer'
import FarmEditor from './editors/FarmEditorContainer'
import MyEntriesList from './myentries/MyEntriesListContainer'
import DeletePlace from './myentries/DeletePlaceContainer'
import SignIn from './user/SignInContainer'
import Layout from './Layout'
import { fetchAllPlaces } from './map/mapActions'
import {
  initializeCreateDepotEditor,
  initializeCreateFarmEditor,
  initializeUpdateDepotEditor,
  initializeUpdateFarmEditor,
  initializeDeletePlaceEditor,
} from './editors/editorActions'

export const MAP = '/'
export const SHOW_DEPOT = '/depots/:id'
export const SHOW_FARM = '/farms/:id'
export const NEW_DEPOT = '/depots/new'
export const NEW_FARM = '/farms/new'
export const EDIT_DEPOT = '/depots/:id/edit'
export const EDIT_FARM = '/farms/:id/edit'
export const DELETE_PLACE = '/places/:id/delete'
export const SIGN_IN = '/users/sign_in'
export const MY_ENTRIES = '/myentries'

export const history = useRouterHistory(createHashHistory)({
  basename: '',
})

export const getDetailsPath = place => `${place.type.toLowerCase()}s/${place.id}`
export const getEditPath = place => `${getDetailsPath(place)}/edit`
export const getDeletePath = place => `/places/${place.id}/delete`


const AppRouter = ({ dispatch }) => (
  <Router history={history}>
    <Route component={Layout} >
      <Route
        path={MAP}
        component={MapContainer}
        onEnter={() => dispatch(fetchAllPlaces())}
      />
      <Route
        path={NEW_DEPOT}
        component={DepotEditor}
        onEnter={() => {
          dispatch(initializeCreateDepotEditor())
          dispatch(fetchAllPlaces()) // fetch data for places select
        }}
      />
      <Route
        path={NEW_FARM}
        component={FarmEditor}
        onEnter={() => dispatch(initializeCreateFarmEditor())}
      />
      <Route
        path={EDIT_DEPOT}
        component={DepotEditor}
        onEnter={(routerState) => {
          dispatch(initializeUpdateDepotEditor(routerState.params.id))
          dispatch(fetchAllPlaces()) // fetch data for places select
        }}
      />
      <Route
        path={EDIT_FARM}
        component={FarmEditor}
        onEnter={routerState => dispatch(initializeUpdateFarmEditor(routerState.params.id))}
      />
      <Route
        path={SHOW_DEPOT}
        component={Details}
        onEnter={routerState => dispatch(initializeUpdateDepotEditor(routerState.params.id))}
      />
      <Route
        path={SHOW_FARM}
        component={Details}
        onEnter={routerState => dispatch(initializeUpdateFarmEditor(routerState.params.id))}
      />
      <Route
        path={DELETE_PLACE}
        component={DeletePlace}
        onEnter={routerState => dispatch(initializeDeletePlaceEditor(routerState.params.id))}
      />
      <Route
        path={SIGN_IN}
        component={SignIn}
      />
      <Route
        path={MY_ENTRIES}
        component={MyEntriesList}
        onEnter={() => dispatch(fetchAllPlaces())} // TODO 'fetch MY places'
      />
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
