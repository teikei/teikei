import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export interface SignInUserParams {
  email: string
  password: string
}

async function signInUser(params: SignInUserParams) {
  return getClient().authenticate({
    email: params.email,
    password: params.password,
    strategy: 'local'
  })
}

type SignInUserData = Awaited<ReturnType<typeof signInUser>>

type UseSignInUserOptions = Omit<
  UseMutationOptions<SignInUserData, Error, SignInUserParams, unknown>,
  'mutationFn'
>

export function useSignInUser(options?: UseSignInUserOptions) {
  return useMutation({
    mutationFn: signInUser,
    ...options
  })
}
