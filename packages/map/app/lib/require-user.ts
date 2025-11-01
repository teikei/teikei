import { redirect } from 'react-router'
import { reAuthenticateUserQuery } from '~/api/re-authenticate-user'
import { queryClient } from '~/lib/query-client'

export const requireUser = async (request: Request) => {
  const { user } = await queryClient.fetchQuery(reAuthenticateUserQuery())
  const path = new URL(request.url).pathname

  if (!user) {
    throw redirect(`/users/sign-in?redirect=${path}`)
  }

  return user
}
