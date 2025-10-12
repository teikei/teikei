import { useQuery } from '@tanstack/react-query'
import { useRouteLoaderData } from 'react-router'
import { reAuthenticateUser } from '~/queries/users.api'
import type { RootLoaderData } from '~/root'

export const reAuthenticateUserQuery = () => ({
  queryKey: ['authenticate'],
  queryFn: async () => {
    try {
      return await reAuthenticateUser()
    } catch (e) {
      return { user: null }
    }
  }
})

export const useUserData = () => {
  const userInitialData = useRouteLoaderData('root') as RootLoaderData
  const reauthenticateUserQuery = useQuery({
    ...reAuthenticateUserQuery(),
    initialData: userInitialData
  })
  return reauthenticateUserQuery.data.user
}
