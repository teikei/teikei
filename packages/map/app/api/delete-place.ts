import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { PlaceType } from '~/types/types'

export interface DeletePlaceParams {
  type: PlaceType
  id: string
}

async function deletePlace(params: DeletePlaceParams) {
  const { type, id } = params
  return getClient().service(type).remove(id)
}

type DeletePlaceData = Awaited<ReturnType<typeof deletePlace>>

type UseDeletePlaceOptions = Omit<
  UseMutationOptions<DeletePlaceData, Error, DeletePlaceParams, unknown>,
  'mutationFn'
>

export function useDeletePlace(options?: UseDeletePlaceOptions) {
  return useMutation({
    mutationFn: deletePlace,
    ...options
  })
}
