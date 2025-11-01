import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { Properties } from '~/types/types'

export type UpdateInitiativeParams = Properties

async function updateInitiative(params: UpdateInitiativeParams) {
  const { id } = params
  return getClient().service('initiatives').patch(id, params)
}

type UpdateInitiativeData = Awaited<ReturnType<typeof updateInitiative>>

type UseUpdateInitiativeOptions = Omit<
  UseMutationOptions<
    UpdateInitiativeData,
    Error,
    UpdateInitiativeParams,
    unknown
  >,
  'mutationFn'
>

export function useUpdateInitiative(options?: UseUpdateInitiativeOptions) {
  return useMutation({
    mutationFn: updateInitiative,
    ...options
  })
}
