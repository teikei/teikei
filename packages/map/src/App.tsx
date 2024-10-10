import ReactDOM from 'react-dom'
import { StrictMode } from 'react'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import { thunk } from 'redux-thunk'
import { createHashRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Search from './containers/Search'
import getRoutes from './routes'
import { GlobalStateProvider } from './StateContext'

export const queryClient = new QueryClient()
const routes = getRoutes()
const router = createHashRouter(routes)

export const makeMap = (store) => {
  return (
    <StrictMode>
      <div className='teikei-embed'>
        <GlobalStateProvider>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <RouterProvider router={router} />
            </Provider>
          </QueryClientProvider>
        </GlobalStateProvider>
      </div>
    </StrictMode>
  )
}

export const makeSearchWidget = (store) => (
  <StrictMode>
    <div className='teikei-embed'>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Search countrySelection={false} useHashRouter={false} />
        </Provider>
      </QueryClientProvider>
    </div>
  </StrictMode>
)

export const render = (config, containerEl, makeComponentFunc) => {
  const reducer = combineReducers({
    form: formReducer
  })

  const store = createStore(reducer, applyMiddleware(thunk))

  // TODO migrate to createRoot with new map
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(makeComponentFunc(store), containerEl)
}
