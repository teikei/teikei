import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import omit from 'lodash/omit'
import { getClient } from '~/lib/clients'

export interface SignUpUserParams {
  email: string
  password: string
  name: string
  phone?: string
  baseurl: string
  locale: string
  passwordConfirmation?: string
}

export async function signUpUser(params: SignUpUserParams) {
  return getClient()
    .service('users')
    .create(omit(params, 'passwordConfirmation'))
}

type SignUpUserData = Awaited<ReturnType<typeof signUpUser>>

type UseSignUpUserOptions = Omit<
  UseMutationOptions<SignUpUserData, Error, SignUpUserParams, unknown>,
  'mutationFn'
>

export function useSignUpUser(options?: UseSignUpUserOptions) {
  return useMutation({
    mutationFn: signUpUser,
    ...options
  })
}
