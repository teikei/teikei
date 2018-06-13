import React from 'react'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import superagent from 'superagent'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reduxPromise from 'redux-promise-middleware'
import feathers from 'feathers-client'
// import reduxifyServices from 'feathers-redux'

import user from './user/userReducer'
import map from './map/mapReducer'
import details from './details/detailsReducer'
import editor from './editors/editorReducer'
import search from './search/searchReducer'
import AppRouter from './AppRouter'
import './site'
import './App.css'

export const client = feathers()
client.configure(feathers.hooks())

const restClient = feathers.rest().superagent(superagent)
client.configure(restClient)

client.configure(
  feathers.authentication({
    storage: window.localStorage
  })
)

// TODO maybe use feathers-redux ?
// export const services = reduxifyServices(restClient, [
//   'users',
//   'depots',
//   'farms',
//   'initiatives',
//   'entries',
//   'geocoder',
//   'autocomplete',
//   'authenticationManagement'
// ])

const reducer = combineReducers({
  // users: services.users.reducer,
  // depots: services.depots.reducer,
  // farms: services.farms.reducer,
  // initiatives: services.initiatives.reducer,
  // entries: services.entries.reducer,
  // geocoder: services.geocoder.reducer,
  // autocomplete: services.autocomplete.reducer,
  // authenticationManagement: services.authenticationManagement.reducer,
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
