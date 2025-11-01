import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { Properties } from '~/types/types'

import { mapDepotToApiParams } from './map-depot-to-api-params'

export type UpdateDepotParams = Properties

async function updateDepot(params: UpdateDepotParams) {
  const { id } = params
  return getClient().service('depots').patch(id, mapDepotToApiParams(params))
}

type UpdateDepotData = Awaited<ReturnType<typeof updateDepot>>

type UseUpdateDepotOptions = Omit<
  UseMutationOptions<UpdateDepotData, Error, UpdateDepotParams, unknown>,
  'mutationFn'
>

export function useUpdateDepot(options?: UseUpdateDepotOptions) {
  return useMutation({
    mutationFn: updateDepot,
    ...options
  })
}
