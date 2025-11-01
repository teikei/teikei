import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import ky from 'ky'
import configuration from '~/config/app-configuration'
import { throwApiError } from '~/lib/clients'

const { apiBaseUrl } = configuration

export interface RecoverUserPasswordParams {
  email: string
}

async function recoverUserPassword(params: RecoverUserPasswordParams) {
  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        json: {
          action: 'sendResetPwd',
          value: params
        }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}

type RecoverUserPasswordData = Awaited<ReturnType<typeof recoverUserPassword>>

type UseRecoverUserPasswordOptions = Omit<
  UseMutationOptions<
    RecoverUserPasswordData,
    Error,
    RecoverUserPasswordParams,
    unknown
  >,
  'mutationFn'
>

export function useRecoverUserPassword(
  options?: UseRecoverUserPasswordOptions
) {
  return useMutation({
    mutationFn: recoverUserPassword,
    ...options
  })
}
