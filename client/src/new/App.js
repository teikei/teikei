import React from 'react'
import { Router, Route } from 'react-router'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import browserHistory from './browserHistory'
import MapContainer from './map/MapContainer'
import DepotDetails from './details/DepotDetails'
import FarmDetails from './details/FarmDetails'
import DepotEditor from './editors/DepotEditorContainer'
import FarmEditor from './editors/FarmEditorContainer'
import MyEntriesList from './myentries/MyEntriesListContainer'
import Layout from './Layout'

import user from './user/userReducer'
import editor from './editors/editorReducer'
import geocoder from './editors/geocoder/geocoderReducer'
import map from './map/mapReducer'

import SignIn from './user/SignInContainer'
import { fetchAllPlaces } from './map/mapActions'

require('./App.css')

const reducer = combineReducers({
  user,
  editor,
  geocoder,
  map,
  form: formReducer,
})

const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f,
  ),
)

const onAppInit = () => {
  store.dispatch(fetchAllPlaces())
}

const RootElement = () => (
  <Router history={browserHistory}>
    <Route path="/" component={Layout} onEnter={onAppInit()}>
      <Route path="/new/depots/new" component={DepotEditor} />
      <Route path="/new/farms/new" component={FarmEditor} />
      <Route path="/new/depots/:id/edit" component={DepotEditor} />
      <Route path="/new/farms/:id/edit" component={FarmEditor} />
      <Route path="/new/depots/:id" component={DepotDetails} />
      <Route path="/new/farms/:id" component={FarmDetails} />
      <Route path="/new/users/sign_in" component={SignIn} />
      <Route path="/new/myentries" component={MyEntriesList} />
      <Route path="/new" component={MapContainer} />
    </Route>
  </Router>
)

const App = () => (
  <Provider store={store}>
    <RootElement />
  </Provider>
)

export default App;
