import { Suspense } from 'react'
import Loading from '~/components/ds/loading'
import UserOnboarding from '~/features/routes/_shared/UserOnboarding'

export default function SignInRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <UserOnboarding />
    </Suspense>
  )
}

export function ErrorBoundary() {
  return <div>Unable to load sign-in page.</div>
}
