import { Suspense } from 'react'
import Loading from '~/components/ds/Loading'
import UserOnboarding from '~/features/routes/_shared/UserOnboarding'

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
