import React from 'react'
import ReactDOM from 'react-dom'
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import superagent from 'superagent'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reduxPromise from 'redux-promise-middleware'
import feathers from 'feathers-client'

import { user } from './containers/UserOnboarding/duck'
import { map } from './containers/Map/duck'
import { details } from './containers/Details/duck'
import { editor } from './containers/EntryForm/duck'
import { search } from './containers/Search/duck'
import Search from './containers/Search'
import AppRouter from './AppRouter'
import withAuthentication from './Authentication'

const withProvider = Component => props => {
  const { store, ...passThroughProps } = props
  return (
    <Provider store={store}>
      <Component {...passThroughProps} />
    </Provider>
  )
}

export const makeMap = store => {
  const AuthenticatedAppRouter = withProvider(withAuthentication(AppRouter))
  return <AuthenticatedAppRouter store={store} dispatch={store.dispatch} />
}

export const makeSearchWidget = store => {
  const SearchWidget = withProvider(Search)
  return <SearchWidget store={store} />
}

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

export const render = (config, containerEl, makeComponentFunc) => {
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

  const store = createStore(reducer, enhancers)

  ReactDOM.render(makeComponentFunc(store), containerEl)
  // registerServiceWorker()
}
