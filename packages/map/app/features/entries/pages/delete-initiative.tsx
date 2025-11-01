import DeletePlaceForm from '~/features/entries/components/delete-place-form'
import {
  makeDeletePlaceClientLoader,
  useDeletePlaceRoute
} from '~/features/entries/hooks/use-delete-place-route'

import type { Route } from '../../../../app/features/entries/pages/+types/delete-initiative'

export const clientLoader =
  makeDeletePlaceClientLoader<Route.ClientLoaderArgs>('initiatives')

export default function InitiativeDeleteRoute() {
  const props = useDeletePlaceRoute('initiatives')
  return <DeletePlaceForm {...props} />
}

export function ErrorBoundary() {
  const props = useDeletePlaceRoute('initiatives')
  return <DeletePlaceForm {...props} onSubmit={() => {}} isSubmitting={false} />
}
