import { useRouteLoaderData } from 'react-router'
import { useReAuthenticateUser } from '~/api/re-authenticate-user'
import type { RootLoaderData } from '~/root'

export const useUserData = () => {
  const userInitialData = useRouteLoaderData('root') as RootLoaderData
  const reauthenticateUserQuery = useReAuthenticateUser({
    initialData: userInitialData
  })
  return reauthenticateUserQuery.data?.user
}
