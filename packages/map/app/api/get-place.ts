import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { PlaceType } from '~/types/types'

export interface GetPlaceParams {
  type: PlaceType
  id: string
}

export const getPlaceQueryKey = (params: GetPlaceParams) =>
  ['getPlace', params.type, params.id] as const

async function getPlace(params: GetPlaceParams) {
  const { type, id } = params
  return getClient().service(type).get(id)
}

export const getPlaceQuery = (params: GetPlaceParams) =>
  queryOptions({
    queryKey: getPlaceQueryKey(params),
    queryFn: () => getPlace(params)
  })

type GetPlaceData = Awaited<ReturnType<typeof getPlace>>
type GetPlaceQueryKey = ReturnType<typeof getPlaceQueryKey>

type UseGetPlaceOptions = Omit<
  UseQueryOptions<GetPlaceData, Error, GetPlaceData, GetPlaceQueryKey>,
  'queryKey' | 'queryFn'
>

export function useGetPlace(
  params: GetPlaceParams,
  options?: UseGetPlaceOptions
) {
  return useQuery({
    ...getPlaceQuery(params),
    ...options
  })
}
