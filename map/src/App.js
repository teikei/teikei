import React from 'react'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import superagent from 'superagent'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reduxPromise from 'redux-promise-middleware'
import feathers from 'feathers-client'
import AuthManagement from 'feathers-authentication-management/lib/client'

import user from './user/userReducer'
import map from './map/mapReducer'
import details from './details/detailsReducer'
import editor from './editors/editorReducer'
import search from './search/searchReducer'
import AppRouter from './AppRouter'
import './site'
import './App.css'
import withAuthentication from './Authentication'

const apiUrl = process.env.REACT_APP_API_URL

export const client = feathers()
client.configure(feathers.hooks())

const restClient = feathers.rest(apiUrl).superagent(superagent)
client.configure(restClient)

client.configure(
  feathers.authentication({
    storage: window.localStorage
  })
)

export const authManagement = new AuthManagement(client)

const reducer = combineReducers({
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

const AuthenticatedAppRouter = withAuthentication(AppRouter)

const store = createStore(reducer, enhancers)
const App = () => (
  <div className="teikei-embed">
    <Provider store={store}>
      <AuthenticatedAppRouter dispatch={store.dispatch} />
    </Provider>
  </div>
)

export default App
