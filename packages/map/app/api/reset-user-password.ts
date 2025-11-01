import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import ky from 'ky'
import configuration from '~/config/app-configuration'
import { throwApiError } from '~/lib/clients'

const { apiBaseUrl } = configuration

export interface ResetUserPasswordParams {
  resetPasswordToken: string
  password: string
}

export async function resetUserPassword(params: ResetUserPasswordParams) {
  const { resetPasswordToken, password } = params

  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        json: {
          action: 'resetPwdLong',
          value: { token: resetPasswordToken, password }
        }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}

type ResetUserPasswordData = Awaited<ReturnType<typeof resetUserPassword>>

type UseResetUserPasswordOptions = Omit<
  UseMutationOptions<
    ResetUserPasswordData,
    Error,
    ResetUserPasswordParams,
    unknown
  >,
  'mutationFn'
>

export function useResetUserPassword(options?: UseResetUserPasswordOptions) {
  return useMutation({
    mutationFn: resetUserPassword,
    ...options
  })
}
