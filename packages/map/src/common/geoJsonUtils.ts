import { Feature } from '../types/types'

export const getLongitude = (feature: Feature) =>
  feature?.geometry?.coordinates[0]
export const getLatitude = (feature: Feature) =>
  feature?.geometry?.coordinates[1]
