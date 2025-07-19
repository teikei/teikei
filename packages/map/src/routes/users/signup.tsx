import { Suspense } from 'react'

import Loading from '@/components/base/Loading'
import UserOnboarding from '@/routes/_shared/UserOnboarding'

export const Component = () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserOnboarding signUp />
    </Suspense>
  )
}

export const ErrorBoundary = Component
