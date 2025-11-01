import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { Properties } from '~/types/types'

export type CreateFarmParams = Omit<Properties, 'id'>

async function createFarm(params: CreateFarmParams) {
  return getClient().service('farms').create(params)
}

type CreateFarmData = Awaited<ReturnType<typeof createFarm>>

type UseCreateFarmOptions = Omit<
  UseMutationOptions<CreateFarmData, Error, CreateFarmParams, unknown>,
  'mutationFn'
>

export function useCreateFarm(options?: UseCreateFarmOptions) {
  return useMutation({
    mutationFn: createFarm,
    ...options
  })
}
