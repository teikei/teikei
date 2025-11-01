import DeletePlaceForm from '~/features/entries/components/delete-place-form'
import {
  makeDeletePlaceClientLoader,
  useDeletePlaceRoute
} from '~/features/entries/hooks/use-delete-place-route'

import type { Route } from '../../../../app/features/entries/pages/+types/delete-farm'

export const clientLoader =
  makeDeletePlaceClientLoader<Route.ClientLoaderArgs>('farms')

export default function FarmDeleteRoute() {
  const props = useDeletePlaceRoute('farms')
  return <DeletePlaceForm {...props} />
}

export function ErrorBoundary() {
  const props = useDeletePlaceRoute('farms')
  return <DeletePlaceForm {...props} onSubmit={() => {}} isSubmitting={false} />
}
