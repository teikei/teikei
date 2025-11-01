import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import ky from 'ky'
import configuration from '~/config/app-configuration'
import { throwApiError } from '~/lib/clients'

const { apiBaseUrl } = configuration

export interface ConfirmUserParams {
  confirmationToken: string
}

export async function confirmUser(params: ConfirmUserParams) {
  const { confirmationToken } = params

  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        json: { action: 'verifySignupLong', value: confirmationToken }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}

type ConfirmUserData = Awaited<ReturnType<typeof confirmUser>>

type UseConfirmUserOptions = Omit<
  UseMutationOptions<ConfirmUserData, Error, ConfirmUserParams, unknown>,
  'mutationFn'
>

export function useConfirmUser(options?: UseConfirmUserOptions) {
  return useMutation({
    mutationFn: confirmUser,
    ...options
  })
}
