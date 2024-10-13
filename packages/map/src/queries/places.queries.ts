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
import { queryOptions } from '@tanstack/react-query'

export const getEntriesQuery = () =>
  queryOptions({
    queryKey: ['getEntries'],
    queryFn: getEntries
  })

export const getMyPlacesQuery = () =>
  queryOptions({
    queryKey: ['getMyPlaces'],
    queryFn: getMyEntries
  })

export const getMyPlaceQuery = (type: PlaceType, id: string) =>
  queryOptions({
    queryKey: ['getMyPlace', type, id],
    queryFn: () => getMyPlace(type, id)
  })

export const getPlaceQuery = (type: PlaceType, id: string) =>
  queryOptions({
    queryKey: ['getPlace', type, id],
    queryFn: () => getPlace(type, id)
  })

export const getGoalsQuery = () =>
  queryOptions({
    queryKey: ['getGoals'],
    queryFn: getGoals
  })

export const getProductsQuery = () =>
  queryOptions({
    queryKey: ['getProducts'],
    queryFn: getProducts
  })

export const getBadgesQuery = () =>
  queryOptions({
    queryKey: ['getBadges'],
    queryFn: getBadges
  })
