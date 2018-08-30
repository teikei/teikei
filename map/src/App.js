import React from 'react'
import ReactDOM from 'react-dom'
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import superagent from 'superagent'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reduxPromise from 'redux-promise-middleware'
import feathers from 'feathers-client'

import registerServiceWorker from './registerServiceWorker'
import { user } from './containers/UserOnboarding/duck'
import { map } from './containers/Map/duck'
import { details } from './containers/Details/duck'
import { editor } from './containers/EntryForm/duck'
import { search } from './containers/Search/duck'
import AppRouter from './AppRouter'
import './site'
import './App.css'
import withAuthentication from './Authentication'

export const makeClient = apiUrl => {
  const client = feathers()
  client.configure(feathers.hooks())
  client.configure(feathers.rest(apiUrl).superagent(superagent))
  client.configure(
    feathers.authentication({
      storage: window.localStorage
    })
  )
  return client
}

export const startApp = (config, containerEl) => {
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
  const App = () => {
    return (
      <div className="teikei-embed">
        <Provider store={store}>
          <AuthenticatedAppRouter dispatch={store.dispatch} />
        </Provider>
      </div>
    )
  }

  ReactDOM.render(<App />, containerEl)
  registerServiceWorker()
}
