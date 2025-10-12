import DeletePlace from '~/features/routes/_shared/DeletePlace'
import { queryClient } from '~/lib/query-client'
import { requireUser } from '~/lib/require-user'
import { getPlaceQuery } from '~/queries/places.queries'

import type { Route } from './+types/initiatives.$id.delete'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  const { id } = args.params
  if (!id) {
    throw new Response('Not Found', { status: 404 })
  }

  return queryClient.fetchQuery(getPlaceQuery('initiatives', id))
}

export default function InitiativeDeleteRoute() {
  return <DeletePlace type='initiatives' />
}

export function ErrorBoundary() {
  return <DeletePlace type='initiatives' />
}
