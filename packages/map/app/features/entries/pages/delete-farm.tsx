import { getPlaceQuery } from '~/api/get-place'
import DeletePlace from '~/features/entries/pages/delete-page'
import { queryClient } from '~/lib/query-client'
import { requireUser } from '~/lib/require-user'

import type { Route } from '../../../../app/features/entries/pages/+types/delete-farm'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  const { id } = args.params
  if (!id) {
    throw new Response('Not Found', { status: 404 })
  }

  return queryClient.fetchQuery(getPlaceQuery({ type: 'farms', id }))
}

export default function FarmDeleteRoute() {
  return <DeletePlace type='farms' />
}

export function ErrorBoundary() {
  return <DeletePlace type='farms' />
}
