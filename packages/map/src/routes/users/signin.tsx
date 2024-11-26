import { Suspense } from 'react'
import Loading from '../../components/base/Loading'
import UserOnboarding from '../_shared/UserOnboarding'

export const Component = () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserOnboarding />
    </Suspense>
  )
}

export const ErrorBoundary = Component
