import DeletePlaceForm from '~/features/entries/components/delete-place-form'
import {
  makeDeletePlaceClientLoader,
  useDeletePlaceRoute
} from '~/features/entries/hooks/use-delete-place-route'

import type { Route } from '../../../../app/features/entries/pages/+types/delete-depot'

export const clientLoader =
  makeDeletePlaceClientLoader<Route.ClientLoaderArgs>('depots')

export default function DepotDeleteRoute() {
  const props = useDeletePlaceRoute('depots')
  return <DeletePlaceForm {...props} />
}

export function ErrorBoundary() {
  const props = useDeletePlaceRoute('depots')
  return <DeletePlaceForm {...props} onSubmit={() => {}} isSubmitting={false} />
}
