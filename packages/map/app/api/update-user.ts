import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export interface UpdateUserParams {
  id: string
  name: string
  phone?: string
  email: string
  locale?: string
}

export async function updateUser(params: UpdateUserParams) {
  return getClient().service('users').patch(params.id, params)
}

type UpdateUserData = Awaited<ReturnType<typeof updateUser>>

type UseUpdateUserOptions = Omit<
  UseMutationOptions<UpdateUserData, Error, UpdateUserParams, unknown>,
  'mutationFn'
>

export function useUpdateUser(options?: UseUpdateUserOptions) {
  return useMutation({
    mutationFn: updateUser,
    ...options
  })
}
