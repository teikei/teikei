import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useEffect, useMemo } from 'react'
import { Provider } from 'react-redux'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError
} from 'react-router'
import Alert from 'react-s-alert'

import type { Route } from './+types/root'

import './app.css'
import '~/lib/i18n/i18n'

import { reAuthenticateUserQuery } from '~/api/users.queries'
import Loading from '~/components/ds/loading'
import ErrorPage from '~/components/page/error-page'
import { queryClient } from '~/lib/query-client'
import { GlobalStateProvider } from '~/lib/state-context'
import { createAppStore } from '~/lib/store'
import { loadDevelopmentFonts } from '~/utils/utils'

export const links: Route.LinksFunction = () => []

export const clientLoader: Route.ClientLoader = async () => {
  return queryClient.fetchQuery(reAuthenticateUserQuery())
}

export type RootLoaderData = Awaited<ReturnType<typeof clientLoader>>

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const store = useMemo(() => createAppStore(), [])

  useEffect(() => {
    loadDevelopmentFonts()
  }, [])

  return (
    <GlobalStateProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <div className='teikei-embed'>
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
            <Alert
              stack={{ limit: 3 }}
              position='top-left'
              timeout={5000}
              effect='stackslide'
              offset={80}
              html
            />
          </div>
        </Provider>
      </QueryClientProvider>
    </GlobalStateProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const routeError = error ?? useRouteError()

  if (isRouteErrorResponse(routeError)) {
    const message = routeError.status === 404 ? '404' : 'Error'
    const details =
      routeError.status === 404
        ? 'The requested page could not be found.'
        : routeError.statusText || 'An unexpected error occurred.'

    return (
      <main className='pt-16 p-4 container mx-auto'>
        <h1>{message}</h1>
        <p>{details}</p>
      </main>
    )
  }

  return (
    <Suspense>
      <ErrorPage error={routeError} />
    </Suspense>
  )
}
