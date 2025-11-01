import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { Properties } from '~/types/types'

export type UpdateFarmParams = Properties

async function updateFarm(params: UpdateFarmParams) {
  const { id } = params
  return getClient().service('farms').patch(id, params)
}

type UpdateFarmData = Awaited<ReturnType<typeof updateFarm>>

type UseUpdateFarmOptions = Omit<
  UseMutationOptions<UpdateFarmData, Error, UpdateFarmParams, unknown>,
  'mutationFn'
>

export function useUpdateFarm(options?: UseUpdateFarmOptions) {
  return useMutation({
    mutationFn: updateFarm,
    ...options
  })
}
