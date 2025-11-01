import { type UseMutationOptions, useMutation } from '@tanstack/react-query'

import { getClient } from '~/lib/clients'

async function signOutUser() {
  return getClient().logout()
}

type SignOutUserData = Awaited<ReturnType<typeof signOutUser>>

type UseSignOutUserOptions = Omit<
  UseMutationOptions<SignOutUserData, Error, void, unknown>,
  'mutationFn'
>

export function useSignOutUser(options?: UseSignOutUserOptions) {
  return useMutation({
    mutationFn: signOutUser,
    ...options
  })
}
