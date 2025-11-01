import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { Properties } from '~/types/types'

import { mapDepotToApiParams } from './map-depot-to-api-params'

export type CreateDepotParams = Omit<Properties, 'id'>

async function createDepot(params: CreateDepotParams) {
  return getClient().service('depots').create(mapDepotToApiParams(params))
}

type CreateDepotData = Awaited<ReturnType<typeof createDepot>>

type UseCreateDepotOptions = Omit<
  UseMutationOptions<CreateDepotData, Error, CreateDepotParams, unknown>,
  'mutationFn'
>

export function useCreateDepot(options?: UseCreateDepotOptions) {
  return useMutation({
    mutationFn: createDepot,
    ...options
  })
}
