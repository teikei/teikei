import { useQuery } from '@tanstack/react-query'
import { useRouteLoaderData } from 'react-router'
import { reAuthenticateUserQuery } from '~/api/re-authenticate-user'
import type { RootLoaderData } from '~/root'

export const useUserData = () => {
  const userInitialData = useRouteLoaderData('root') as RootLoaderData
  const reauthenticateUserQuery = useQuery({
    ...reAuthenticateUserQuery(),
    initialData: userInitialData
  })
  return reauthenticateUserQuery.data.user
}
