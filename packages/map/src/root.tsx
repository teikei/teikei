import Alert from 'react-s-alert'
import { Outlet, useLoaderData, useRouteError } from 'react-router'
import { useQuery } from '@tanstack/react-query'

import { authenticateUserQuery } from './queries/users.queries.ts'
import { useGlobalState } from './StateContext.tsx'
import { queryClient } from './App.tsx'

export const loader = async () => {
  return await queryClient.fetchQuery(authenticateUserQuery)
}

export const Component = () => {
  const { setCurrentUser } = useGlobalState()

  const initialData = useLoaderData() as Awaited<ReturnType<typeof loader>>

  useQuery({
    ...authenticateUserQuery,
    queryFn: async () => {
      const response = await authenticateUserQuery.queryFn()
      setCurrentUser(response.user)
      return response
    },
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
