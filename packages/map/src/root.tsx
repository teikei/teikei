import { Suspense } from 'react'
import { Outlet, useRouteError } from 'react-router'
import Alert from 'react-s-alert'
import Loading from '@/components/base/Loading'
import ErrorPage from '@/components/page/ErrorPage'
import { queryClient } from '@/main'
import { reAuthenticateUserQuery } from '@/queries/users.queries'

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
