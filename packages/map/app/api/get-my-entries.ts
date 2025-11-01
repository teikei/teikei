import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

const queryKey = ['getMyEntries'] as const

export async function getMyEntries() {
  return getClient()
    .service('entries')
    .find({ query: { mine: true } })
}

export const getMyEntriesQuery = () =>
  queryOptions({
    queryKey,
    queryFn: getMyEntries
  })

type GetMyEntriesData = Awaited<ReturnType<typeof getMyEntries>>
type GetMyEntriesQueryKey = typeof queryKey

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
