import Alert from 'react-s-alert'
import { Outlet, useRouteError } from 'react-router'

import { queryClient } from './App'
import { reAuthenticateUserQuery } from './queries/users.queries'
import { useTranslation } from 'react-i18next'
import { Suspense } from 'react'
import Loading from './components/base/Loading.tsx'

export const loader = async () => {
  return queryClient.fetchQuery(reAuthenticateUserQuery())
}

export type RootLoaderData = Awaited<ReturnType<typeof loader>>

export const Component = () => {
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
  const { t } = useTranslation()
  const error = useRouteError()

  return (
    <Suspense fallback={<Loading />}>
      <div>
        {t('errors.general_root_error')} {error.toString()}
      </div>
    </Suspense>
  )
}
ErrorBoundary.displayName = 'RootErrorBoundary'
