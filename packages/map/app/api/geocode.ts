import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export interface GeocodeParams {
  locationid: string
}

export interface GeocodeQueryParams {
  locationid?: string
}

const geocodeQueryKey = (params: GeocodeQueryParams) =>
  ['geocode', params.locationid] as const

export async function geocode(params: GeocodeParams) {
  return getClient().service('geocoder').create(params)
}

export const geocodeLocationIdQuery = (params: GeocodeQueryParams) =>
  queryOptions({
    queryKey: geocodeQueryKey(params),
    queryFn: async () => {
      if (!params.locationid) {
        return null
      }

      return geocode({ locationid: params.locationid })
    }
  })

type GeocodeData = Awaited<ReturnType<typeof geocode>>
type GeocodeQueryKey = ReturnType<typeof geocodeQueryKey>

type UseGeocodeOptions = Omit<
  UseQueryOptions<
    GeocodeData | null,
    Error,
    GeocodeData | null,
    GeocodeQueryKey
  >,
  'queryKey' | 'queryFn'
>

export function useGeocode(
  params: GeocodeQueryParams,
  options?: UseGeocodeOptions
) {
  const defaultEnabled = Boolean(params.locationid)

  return useQuery({
    ...geocodeLocationIdQuery(params),
    enabled: options?.enabled ?? defaultEnabled,
    ...options
  })
}
