import { queryOptions } from '@tanstack/react-query'

import type { PlaceType } from '~/types/types'

import {
  getBadges,
  getEntries,
  getGoals,
  getMyEntries,
  getMyEntry,
  getPlace,
  getProducts
} from './places.api'

export const getEntriesQuery = () =>
  queryOptions({
    queryKey: ['getEntries'],
    queryFn: getEntries
  })

export const getMyEntriesQuery = () =>
  queryOptions({
    queryKey: ['getMyEntries'],
    queryFn: getMyEntries
  })

export const getMyEntryQuery = (type: PlaceType, id: string) =>
  queryOptions({
    queryKey: ['getMyEntry', type, id],
    queryFn: () => getMyEntry({ type, id })
  })

export const getPlaceQuery = (type: PlaceType, id: string) =>
  queryOptions({
    queryKey: ['getPlace', type, id],
    queryFn: () => getPlace({ type, id })
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
