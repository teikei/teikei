import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import ky from 'ky'
import configuration from '~/config/app-configuration'

const { apiBaseUrl } = configuration

const queryKey = ['getEntries'] as const

export async function getEntries() {
  return ky.get(`${apiBaseUrl}/entries`).json()
}

export const getEntriesQuery = () =>
  queryOptions({
    queryKey,
    queryFn: getEntries
  })

type GetEntriesData = Awaited<ReturnType<typeof getEntries>>
type GetEntriesQueryKey = typeof queryKey

type UseGetEntriesOptions = Omit<
  UseQueryOptions<GetEntriesData, Error, GetEntriesData, GetEntriesQueryKey>,
  'queryKey' | 'queryFn'
>

export function useGetEntries(options?: UseGetEntriesOptions) {
  return useQuery({
    ...getEntriesQuery(),
    ...options
  })
}
