import { getPlaceQuery } from '~/api/get-place'
import DeletePlaceForm from '~/features/entries/components/delete-place-form'
import { useDeletePlaceRoute } from '~/features/entries/hooks/use-delete-place-route'
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
  const props = useDeletePlaceRoute('farms')
  return <DeletePlaceForm {...props} />
}

export function ErrorBoundary() {
  const props = useDeletePlaceRoute('farms')
  return <DeletePlaceForm {...props} onSubmit={() => {}} isSubmitting={false} />
}
