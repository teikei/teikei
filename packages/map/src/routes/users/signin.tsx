import UserOnboarding from '../_shared/UserOnboarding'
import Loading from '../../components/base/Loading'
import { Suspense } from 'react'

export const Component = () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserOnboarding />
    </Suspense>
  )
}

export const ErrorBoundary = Component
