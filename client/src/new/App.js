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

// -- teikei state shape:
//
// {
//   user: {
//     currentUser: obj,
//     loggedIn: bool
//   }
//   editors: {
//     currentEntry: obj,
//     isEditing: bool
//   }
//   places: {
//     farms: array
//     depots: array
//   }
//   form: obj
// }

const reducer = combineReducers({
  user,
  editor,
  form: formReducer,
})

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(thunk),
  ),
)

const App = () => (
  <Provider store={store}>
    <RootElement />
  </Provider>
)

export default App;
