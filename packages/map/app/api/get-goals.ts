import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

const queryKey = ['getGoals'] as const

export async function getGoals() {
  return getClient().service('goals').find()
}

export const getGoalsQuery = () =>
  queryOptions({
    queryKey,
    queryFn: getGoals
  })

type GetGoalsData = Awaited<ReturnType<typeof getGoals>>
type GetGoalsQueryKey = typeof queryKey

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
