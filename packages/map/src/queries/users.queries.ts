import { useQuery } from '@tanstack/react-query'
import { useRouteLoaderData } from 'react-router'
import { RootLoaderData } from '../root'
import { reAuthenticateUser } from './users.api'

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
