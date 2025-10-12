import type { Route } from './+types/depots.$id.delete'

import DeletePlace from '~/features/routes/_shared/DeletePlace'
import { queryClient } from '~/lib/query-client'
import { requireUser } from '~/lib/require-user'
import { getPlaceQuery } from '~/queries/places.queries'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  const { id } = args.params
  if (!id) {
    throw new Response('Not Found', { status: 404 })
  }

  return queryClient.fetchQuery(getPlaceQuery('depots', id))
}

export default function DepotDeleteRoute() {
  return <DeletePlace type='depots' />
}

export function ErrorBoundary() {
  return <DeletePlace type='depots' />
}
