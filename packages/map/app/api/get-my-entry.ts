import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import { placeTypeToEntryType } from '~/types/types'
import type { PlaceType } from '~/types/types'

export interface GetMyEntryParams {
  type: PlaceType
  id: string
}

const getMyEntryQueryKey = (params: GetMyEntryParams) =>
  ['getMyEntry', params.type, params.id] as const

export async function getMyEntry(params: GetMyEntryParams) {
  const { type, id } = params
  const feClient = getClient()
  const ownershipCheck = await feClient
    .service('entries')
    .find({ query: { mine: true, type: placeTypeToEntryType(type), id } })

  if (ownershipCheck.features.length !== 1) {
    throw new Error('Unauthorized')
  }

  return feClient.service(type).get(id)
}

export const getMyEntryQuery = (params: GetMyEntryParams) =>
  queryOptions({
    queryKey: getMyEntryQueryKey(params),
    queryFn: () => getMyEntry(params)
  })

type GetMyEntryData = Awaited<ReturnType<typeof getMyEntry>>
type GetMyEntryQueryKey = ReturnType<typeof getMyEntryQueryKey>

type UseGetMyEntryOptions = Omit<
  UseQueryOptions<GetMyEntryData, Error, GetMyEntryData, GetMyEntryQueryKey>,
  'queryKey' | 'queryFn'
>

export function useGetMyEntry(
  params: GetMyEntryParams,
  options?: UseGetMyEntryOptions
) {
  return useQuery({
    ...getMyEntryQuery(params),
    ...options
  })
}
