import React from 'react'
import ReactDOM from 'react-dom'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import superagent from 'superagent'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import { thunk } from 'redux-thunk'
import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import authentication from '@feathersjs/authentication-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Search from './containers/Search'
import AppRouter from './AppRouter'
import withAuthentication from './Authentication'
import { GlobalStateProvider } from './StateContext'

const queryClient = new QueryClient()

export const makeMap = (store) => {
  const AuthenticatedAppRouter = withAuthentication(AppRouter)
  return (
    <React.StrictMode>
      <div className='teikei-embed'>
        <GlobalStateProvider>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <AuthenticatedAppRouter dispatch={store.dispatch} />
            </Provider>
          </QueryClientProvider>
        </GlobalStateProvider>
      </div>
    </React.StrictMode>
  )
}

export const makeSearchWidget = (store) => (
  <React.StrictMode>
    <div className='teikei-embed'>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Search countrySelection={false} useHashRouter={false} />
        </Provider>
      </QueryClientProvider>
    </div>
  </React.StrictMode>
)

export const makeClient = (apiUrl) => {
  const client = feathers()
  const restClient = rest(apiUrl).superagent(superagent)
  client.configure(restClient)
  client.configure(
    authentication({
      storage: window.localStorage
    })
  )
  return client
}

export const render = (config, containerEl, makeComponentFunc) => {
  const reducer = combineReducers({
    form: formReducer
  })

  const store = createStore(reducer, applyMiddleware(thunk))

  // TODO migrate to createRoot with new map
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(makeComponentFunc(store), containerEl)
}
