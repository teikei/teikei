import DeletePlace from '../_shared/DeletePlace'
import { getPlaceQuery } from '../../queries/places.queries'
import { queryClient } from '../../main'

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return queryClient.fetchQuery(getPlaceQuery('farms', id))
}

export const Component = () => {
  return <DeletePlace type='farms' />
}

export const ErrorBoundary = Component
