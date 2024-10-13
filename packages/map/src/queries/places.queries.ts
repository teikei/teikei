import {
  getEntries,
  getMyPlace,
  getMyEntries,
  getPlace,
  getGoals,
  getProducts,
  getBadges
} from './places.api'
import { PlaceType } from '../types/types'

export const getEntriesQuery = () => ({
  queryKey: ['getEntries'],
  queryFn: getEntries
})

export const getMyPlacesQuery = () => ({
  queryKey: ['getMyPlaces'],
  queryFn: getMyEntries
})

export const getMyPlaceQuery = (type: PlaceType, id: string) => ({
  queryKey: ['getMyPlace', type, id],
  queryFn: () => getMyPlace(type, id)
})

export const getPlaceQuery = (type: PlaceType, id: string) => ({
  queryKey: ['getPlace', type, id],
  queryFn: () => getPlace(type, id)
})

export const getGoalsQuery = () => ({
  queryKey: ['getGoals'],
  queryFn: getGoals
})

export const getProductsQuery = () => ({
  queryKey: ['getProducts'],
  queryFn: getProducts
})

export const getBadgesQuery = () => ({
  queryKey: ['getBadges'],
  queryFn: getBadges
})
