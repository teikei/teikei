// organize-imports-ignore
import {
  DefaultError,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createHashRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import Alert from 'react-s-alert'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { thunk } from 'redux-thunk'
import { getErrorMessage } from './common/editorUtils'
import Loading from './components/base/Loading'
import Search from './components/page/Search'
import {
  appContainerEl,
  searchContainerEl,
  networkContainerEl
} from './configuration'
import './i18n/i18n'
import { loadDevelopmentFonts } from './lib/utils'
import getRoutes from './routes'
import { GlobalStateProvider } from './StateContext'
import { ErrorResponse } from './types/types'
import { NetworkWidget } from './components/page/NetworkWidget.tsx'

import './index.css'

// Load fonts conditionally based on environment
loadDevelopmentFonts()

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

const renderMap = (containerEl) => {
  const reducer = combineReducers({
    form: formReducer
  })

  const store = createStore(reducer, applyMiddleware(thunk))

  const routes = getRoutes()
  const router = createHashRouter(routes)

  // TODO migrate to createRoot after map redesign
  /* eslint-disable-next-line react/no-deprecated */
  ReactDOM.render(
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
    </StrictMode>,
    containerEl
  )
}

const renderSearchWidget = (containerEl) => {
  // TODO migrate to createRoot after map redesign
  /* eslint-disable-next-line react/no-deprecated */
  ReactDOM.render(
    <StrictMode>
      <div className='teikei-embed'>
        <GlobalStateProvider>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={<Loading />}>
              <Search countrySelection={false} useHashRouter={false} />
            </Suspense>
          </QueryClientProvider>
        </GlobalStateProvider>
      </div>
    </StrictMode>,
    containerEl
  )
}

const renderNetworkWidget = (containerEl) => {
  // TODO migrate to createRoot after map redesign
  /* eslint-disable-next-line react/no-deprecated */
  ReactDOM.render(
    <StrictMode>
      <div className='teikei-embed'>
        <GlobalStateProvider>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={<Loading />}>
              <NetworkWidget />
            </Suspense>
          </QueryClientProvider>
        </GlobalStateProvider>
      </div>
    </StrictMode>,
    containerEl
  )
}

if (appContainerEl) {
  renderMap(appContainerEl)
}

if (searchContainerEl) {
  renderSearchWidget(searchContainerEl)
}

if (networkContainerEl) {
  renderNetworkWidget(networkContainerEl)
}
