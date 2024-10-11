import EditorFarm from '../_shared/EditorFarm'
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
  return <EditorFarm mode='update' />
}
