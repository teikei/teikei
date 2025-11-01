import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export const getMyEntriesQueryKey = ['getMyEntries'] as const

async function getMyEntries() {
  return getClient()
    .service('entries')
    .find({ query: { mine: true } })
}

export const getMyEntriesQuery = () =>
  queryOptions({
    queryKey: getMyEntriesQueryKey,
    queryFn: getMyEntries
  })

type GetMyEntriesData = Awaited<ReturnType<typeof getMyEntries>>
type GetMyEntriesQueryKey = typeof getMyEntriesQueryKey

type UseGetMyEntriesOptions = Omit<
  UseQueryOptions<
    GetMyEntriesData,
    Error,
    GetMyEntriesData,
    GetMyEntriesQueryKey
  >,
  'queryKey' | 'queryFn'
>

export function useGetMyEntries(options?: UseGetMyEntriesOptions) {
  return useQuery({
    ...getMyEntriesQuery(),
    ...options
  })
}
