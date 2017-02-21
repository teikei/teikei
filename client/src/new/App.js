import React from 'react'
import { Router, Route } from 'react-router'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import Alert from 'react-s-alert';
import browserHistory from './browserHistory'
import MapContainer from './map/MapContainer'
import DepotDetails from './details/DepotDetails'
import FarmDetails from './details/FarmDetails'
import DepotEditor from './editors/DepotEditorContainer'
import FarmEditor from './editors/FarmEditorContainer'

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

const Layout = ({ children }) => (
  <div>
    {children}
    <Alert stack={{ limit: 3 }} position="top-left" effect="stackslide" />
  </div>
)

Layout.propTypes = {
  children: React.PropTypes.element.isRequired,
}

const onAppInit = () => {
  store.dispatch(fetchAllPlaces())
}

const RootElement = () => (
  <Router history={browserHistory}>
    <Route path="/" component={Layout} onEnter={onAppInit()}>
      <Route path="/new/depots/add" component={DepotEditor} />
      <Route path="/new/farms/add" component={FarmEditor} />
      <Route path="/new/depots/:id" component={DepotDetails} />
      <Route path="/new/farms/:id" component={FarmDetails} />
      <Route path="/new/users/sign_in" component={SignIn} />
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
