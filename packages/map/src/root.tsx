import Alert from 'react-s-alert'
import { Outlet, useLoaderData, useRouteError } from 'react-router'
import { useQuery } from '@tanstack/react-query'

import { reAuthenticateUserQuery } from './queries/users.queries'
import { queryClient } from './App'

export const loader = async () => {
  return queryClient.fetchQuery(reAuthenticateUserQuery())
}

export type RootLoaderData = Awaited<ReturnType<typeof loader>>

export const Component = () => {
  const initialData = useLoaderData() as RootLoaderData
  useQuery({
    ...reAuthenticateUserQuery(),
    initialData
  })

  return (
    <div>
      <Outlet />
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

// TODO implement ErrorBoundary
export const ErrorBoundary = () => {
  const error = useRouteError()

  return <div>Something went wrong: {error.toString()}</div>
}
ErrorBoundary.displayName = 'RootErrorBoundary'
