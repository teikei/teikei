import React from 'react'
import { Router, Route } from 'react-router'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import browserHistory from './browserHistory'
import Map from './map/Map'
import DepotDetails from './details/DepotDetails'
import FarmDetails from './details/FarmDetails'
import DepotEditor from './editors/DepotEditorContainer'
import FarmEditor from './editors/FarmEditorContainer'
import user from './user/userReducer'
import editor from './editors/editorReducer'
import geocoder from './editors/geocoder/geocoderReducer'
import SignIn from './user/SignInContainer'

require('./App.css')

const RootElement = () => (
  <Router history={browserHistory}>
    <Route path="/new/depots/add" component={DepotEditor} />
    <Route path="/new/farms/add" component={FarmEditor} />
    <Route path="/new/depots/:id" component={DepotDetails} />
    <Route path="/new/farms/:id" component={FarmDetails} />
    <Route path="/new/users/sign_in" component={SignIn} />
    <Route path="/new" component={Map} />
  </Router>
)

const reducer = combineReducers({
  user,
  editor,
  geocoder,
  form: formReducer,
})

const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ),
)

const App = () => (
  <Provider store={store}>
    <RootElement />
  </Provider>
)

export default App;
