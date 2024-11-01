import { redirect } from 'react-router-dom'

import { queryClient } from '../main'
import { reAuthenticateUserQuery } from '../queries/users.queries.ts'

export const loader = async ({ request }) => {
  const { user } = await queryClient.fetchQuery(reAuthenticateUserQuery())
  const path = new URL(request.url).pathname
  if (!user) {
    return redirect(`/users/sign-in?redirect=${path}`)
  }
  return null
}
