import MapComponent from '../_shared/MapComponent.tsx'
import { queryClient } from '../../App'
import { getEntriesQuery } from '../../queries/places.queries.ts'

export const loader = async () => {
  return queryClient.fetchQuery(getEntriesQuery)
}

export const Component = () => <MapComponent mode='map' />
