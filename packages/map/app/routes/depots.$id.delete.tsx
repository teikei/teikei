import { getPlaceQuery } from '~/api/get-place'
import DeletePlace from '~/features/entries/pages/delete-page'
import { queryClient } from '~/lib/query-client'
import { requireUser } from '~/lib/require-user'

import type { Route } from './+types/depots.$id.delete'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  const { id } = args.params
  if (!id) {
    throw new Response('Not Found', { status: 404 })
  }

  return queryClient.fetchQuery(getPlaceQuery({ type: 'depots', id }))
}

export default function DepotDeleteRoute() {
  return <DeletePlace type='depots' />
}

export function ErrorBoundary() {
  return <DeletePlace type='depots' />
}
