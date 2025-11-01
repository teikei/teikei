import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import ky from 'ky'
import configuration from '~/config/app-configuration'
import { throwApiError } from '~/lib/clients'

const { apiBaseUrl } = configuration

export interface ReactivateUserParams {
  id: string
  token: string
}

async function reactivateUser(params: ReactivateUserParams) {
  const { id, token } = params

  try {
    return await ky
      .post(`${apiBaseUrl}/user-reactivation`, {
        json: { id, token }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}

type ReactivateUserData = Awaited<ReturnType<typeof reactivateUser>>

type UseReactivateUserOptions = Omit<
  UseMutationOptions<ReactivateUserData, Error, ReactivateUserParams, unknown>,
  'mutationFn'
>

export function useReactivateUser(options?: UseReactivateUserOptions) {
  return useMutation({
    mutationFn: reactivateUser,
    ...options
  })
}
