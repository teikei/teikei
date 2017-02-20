import React from 'react'
import { Router, Route } from 'react-router'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import browserHistory from './browserHistory'
import rootReducer from './reducers'
import Map from './components/map/Map'
import DepotDetails from './components/details/DepotDetails'
import FarmDetails from './components/details/FarmDetails'
import SignIn from './containers/SignIn'

require('./App.css')

const RootElement = () => (
  <Router history={browserHistory}>
    <Route path="/new/depots/:id" component={DepotDetails} />
    <Route path="/new/farms/:id" component={FarmDetails} />
    <Route path="/new/users/sign_in" component={SignIn} />
    <Route path="/new" component={Map} />
  </Router>
)

// setup redux dev tools
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk)),
)

const App = () => (
  <Provider store={store}>
    <RootElement />
  </Provider>
)

export default App;
