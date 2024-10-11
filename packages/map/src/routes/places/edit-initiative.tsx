import EditorInitiative from '../_shared/EditorInitiative'
import { getMyPlaceQuery } from '../../queries/places.queries'
import { queryClient } from '../../App'

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return queryClient.fetchQuery(getMyPlaceQuery('depots', id))
}

export const Component = () => {
  return <EditorInitiative mode='update' />
}
