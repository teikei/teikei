import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import './styles/app.scss'

import { appContainerEl, searchContainerEl } from './configuration'

import './i18n/i18n'

import ReactDOM from 'react-dom'
import { StrictMode, Suspense } from 'react'
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
import { getErrorMessage } from './common/editorUtils'
import { ErrorResponse } from './types/types'
import Loading from './components/base/Loading'

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

if (appContainerEl) {
  renderMap(appContainerEl)
}

if (searchContainerEl) {
  renderSearchWidget(searchContainerEl)
}
