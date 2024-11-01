import Alert from 'react-s-alert'
import { Outlet, useRouteError } from 'react-router-dom'

import { queryClient } from './main'
import { reAuthenticateUserQuery } from './queries/users.queries'
import { Suspense } from 'react'
import Loading from './components/base/Loading.tsx'
import ErrorPage from './components/page/ErrorPage.tsx'

export const loader = async () => {
  return await queryClient.fetchQuery(reAuthenticateUserQuery())
}

export type RootLoaderData = Awaited<ReturnType<typeof loader>>

export const Component = () => {
  return (
    <div>
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
  )
}
Component.displayName = 'Root'

export const ErrorBoundary = () => {
  const error = useRouteError()
  return (
    <Suspense>
      <ErrorPage error={error} />
    </Suspense>
  )
}
