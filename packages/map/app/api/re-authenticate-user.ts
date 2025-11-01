import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

const queryKey = ['authenticate'] as const

export async function reAuthenticateUser() {
  return getClient().reAuthenticate(true)
}

export const reAuthenticateUserQuery = () =>
  queryOptions({
    queryKey,
    queryFn: async () => {
      try {
        return await reAuthenticateUser()
      } catch (error) {
        return { user: null }
      }
    }
  })

type ReAuthenticateUserData = Awaited<ReturnType<typeof reAuthenticateUser>>
type ReAuthenticateUserQueryKey = typeof queryKey

type UseReAuthenticateUserOptions = Omit<
  UseQueryOptions<
    ReAuthenticateUserData,
    Error,
    ReAuthenticateUserData,
    ReAuthenticateUserQueryKey
  >,
  'queryKey' | 'queryFn'
>

export function useReAuthenticateUser(options?: UseReAuthenticateUserOptions) {
  return useQuery({
    ...reAuthenticateUserQuery(),
    ...options
  })
}
