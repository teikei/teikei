import ReactDOM from 'react-dom'
import { StrictMode } from 'react'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import { thunk } from 'redux-thunk'
import { createHashRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router'
import {
  DefaultError,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import Alert from 'react-s-alert'

import Search from './components/page/Search'
import getRoutes from './routes'
import { GlobalStateProvider } from './StateContext'
import { getErrorMessage } from './common/editorUtils.ts'
import { ErrorResponse } from './types/types.ts'

const handleError = (error: DefaultError, errorMessage?: string) => {
  const errorResponse = error as unknown as ErrorResponse
  const resolvedErrorMessage = errorMessage || getErrorMessage(errorResponse)
  if (errorResponse.code !== 401) {
    Alert.error(`${resolvedErrorMessage} / ${error.message}`)
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleError(error, query?.meta?.errorMessage as string)
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, _, __, mutation) => {
      handleError(error, mutation?.meta?.errorMessage as string)
    }
  })
})

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

export const render = (containerEl, makeComponentFunc) => {
  const reducer = combineReducers({
    form: formReducer
  })

  const store = createStore(reducer, applyMiddleware(thunk))

  // TODO migrate to createRoot with new map
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(makeComponentFunc(store), containerEl)
}
