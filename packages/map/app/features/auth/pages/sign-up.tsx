import { Suspense } from 'react'
import Loading from '~/components/ds/loading'
import UserOnboarding from '~/features/auth/components/user-onboarding'

export default function SignUpRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <UserOnboarding signUp />
    </Suspense>
  )
}

export function ErrorBoundary() {
  return <div>Unable to load sign-up page.</div>
}
