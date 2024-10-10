import { getEntries, getMyPlaces, getPlace } from './places.api.ts'
import { PlaceType } from '../types/types.ts'

export const getEntriesQuery = {
  queryKey: ['getEntries'],
  queryFn: getEntries
}

export const getMyPlacesQuery = {
  queryKey: ['getMyPlaces'],
  queryFn: getMyPlaces
}

export const getPlaceQuery = (type: PlaceType, id: string) => ({
  queryKey: ['getPlace', type, id],
  queryFn: () => getPlace(type, id)
})
