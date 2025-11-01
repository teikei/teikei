import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export const reAuthenticateUserQueryKey = ['authenticate'] as const

async function reAuthenticateUser() {
  return getClient().reAuthenticate(true)
}

export const reAuthenticateUserQuery = () =>
  queryOptions({
    queryKey: reAuthenticateUserQueryKey,
    queryFn: async () => {
      try {
        return await reAuthenticateUser()
      } catch (error) {
        return { user: null }
      }
    }
  })

type ReAuthenticateUserData = Awaited<ReturnType<typeof reAuthenticateUser>>
type ReAuthenticateUserQueryKey = typeof reAuthenticateUserQueryKey

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
