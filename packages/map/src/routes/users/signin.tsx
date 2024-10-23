import UserOnboarding from '../_shared/UserOnboarding'
import Loading from '../../components/base/Loading.tsx'
import { Suspense } from 'react'

export const Component = () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserOnboarding />
    </Suspense>
  )
}

export const ErrorBoundary = Component
