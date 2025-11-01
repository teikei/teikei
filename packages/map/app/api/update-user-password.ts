import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import ky, { HTTPError } from 'ky'

import configuration from '~/config/app-configuration'
import { getClient } from '~/lib/clients'

const { apiBaseUrl } = configuration

export interface UpdateUserPasswordParams {
  oldPassword: string
  password: string
  email: string
}

async function updateUserPassword(params: UpdateUserPasswordParams) {
  const { oldPassword, password, email } = params

  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        headers: {
          Authorization: `Bearer ${await getClient().authentication.getAccessToken()}`
        },
        json: {
          action: 'passwordChange',
          value: { user: { email }, oldPassword, password }
        }
      })
      .json()
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorResponse = (await error.response.json()) as {
        message?: string
      }
      throw new Error(errorResponse.message ?? 'Password update failed')
    }

    throw error
  }
}

type UpdateUserPasswordData = Awaited<ReturnType<typeof updateUserPassword>>

type UseUpdateUserPasswordOptions = Omit<
  UseMutationOptions<
    UpdateUserPasswordData,
    Error,
    UpdateUserPasswordParams,
    unknown
  >,
  'mutationFn'
>

export function useUpdateUserPassword(options?: UseUpdateUserPasswordOptions) {
  return useMutation({
    mutationFn: updateUserPassword,
    ...options
  })
}
