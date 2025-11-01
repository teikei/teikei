import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export const getBadgesQueryKey = ['getBadges'] as const

async function getBadges() {
  return getClient().service('badges').find()
}

export const getBadgesQuery = () =>
  queryOptions({
    queryKey: getBadgesQueryKey,
    queryFn: getBadges
  })

type GetBadgesData = Awaited<ReturnType<typeof getBadges>>
type GetBadgesQueryKey = typeof getBadgesQueryKey

type UseGetBadgesOptions = Omit<
  UseQueryOptions<GetBadgesData, Error, GetBadgesData, GetBadgesQueryKey>,
  'queryKey' | 'queryFn'
>

export function useGetBadges(options?: UseGetBadgesOptions) {
  return useQuery({
    ...getBadgesQuery(),
    ...options
  })
}
