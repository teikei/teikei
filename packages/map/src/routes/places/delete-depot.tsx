import DeletePlace from '../../pages/delete-place'
import { getPlaceQuery } from '../../queries/places.queries'
import { queryClient } from '../../App'

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return queryClient.fetchQuery(getPlaceQuery('depots', id))
}

export const Component = () => {
  return <DeletePlace type='depots' />
}
