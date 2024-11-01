import DeletePlace from '../_shared/DeletePlace'
import { getPlaceQuery } from '../../queries/places.queries'
import { queryClient } from '../../main'

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return queryClient.fetchQuery(getPlaceQuery('initiatives', id))
}

export const Component = () => {
  return <DeletePlace type='initiatives' />
}

export const ErrorBoundary = Component
