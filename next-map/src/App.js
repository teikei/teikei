import React from 'react'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import superagent from 'superagent'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reduxPromise from 'redux-promise-middleware'
import feathers from 'feathers-client'
import reduxifyServices from 'feathers-redux'

import user from './user/userReducer'
import map from './map/mapReducer'
import details from './details/detailsReducer'
import editor from './editors/editorReducer'
import search from './search/searchReducer'
import AppRouter from './AppRouter'
import './site'
import './App.css'

const feathersClient = feathers().configure(
  feathers.rest().superagent(superagent)
)
export const client = reduxifyServices(feathersClient, [
  'users',
  'depots',
  'farms',
  'initiatives',
  'entries',
  'authentication',
  'authenticationManagement'
])

const reducer = combineReducers({
  users: client.users.reducer,
  depots: client.depots.reducer,
  farms: client.farms.reducer,
  initiatives: client.initiatives.reducer,
  entries: client.entries.reducer,
  authentication: client.authentication.reducer,
  authenticationManagement: client.authenticationManagement.reducer,
  user,
  map,
  details,
  editor,
  search,
  form: formReducer
})

const enhancers = compose(
  applyMiddleware(thunk, reduxPromise()),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)

const store = createStore(reducer, enhancers)
const App = () => (
  <div className="teikei-embed">
    <Provider store={store}>
      <AppRouter dispatch={store.dispatch} />
    </Provider>
  </div>
)

export default App
