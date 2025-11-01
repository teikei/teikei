import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { Properties } from '~/types/types'

export type CreateInitiativeParams = Omit<Properties, 'id'>

export async function createInitiative(params: CreateInitiativeParams) {
  return getClient().service('initiatives').create(params)
}

type CreateInitiativeData = Awaited<ReturnType<typeof createInitiative>>

type UseCreateInitiativeOptions = Omit<
  UseMutationOptions<
    CreateInitiativeData,
    Error,
    CreateInitiativeParams,
    unknown
  >,
  'mutationFn'
>

export function useCreateInitiative(options?: UseCreateInitiativeOptions) {
  return useMutation({
    mutationFn: createInitiative,
    ...options
  })
}
