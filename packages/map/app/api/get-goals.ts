import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export const getGoalsQueryKey = ['getGoals'] as const

async function getGoals() {
  return getClient().service('goals').find()
}

export const getGoalsQuery = () =>
  queryOptions({
    queryKey: getGoalsQueryKey,
    queryFn: getGoals
  })

type GetGoalsData = Awaited<ReturnType<typeof getGoals>>
type GetGoalsQueryKey = typeof getGoalsQueryKey

type UseGetGoalsOptions = Omit<
  UseQueryOptions<GetGoalsData, Error, GetGoalsData, GetGoalsQueryKey>,
  'queryKey' | 'queryFn'
>

export function useGetGoals(options?: UseGetGoalsOptions) {
  return useQuery({
    ...getGoalsQuery(),
    ...options
  })
}
