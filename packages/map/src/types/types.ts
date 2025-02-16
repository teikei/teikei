export interface User {
  id: string
  name: string
  email: string
}

// TODO simplify types
export type FeatureType = 'Depot' | 'Farm' | 'Initiative'
export type PlaceType = 'depots' | 'farms' | 'initiatives'
export type EntryType = 'depot' | 'farm' | 'initiative'

export const placeTypeToEntryType = (type: PlaceType): EntryType => {
  return type.slice(0, -1) as EntryType
}

export const featureTypeToPlaceType = (type: FeatureType) => {
  return `${type.toLowerCase()}s` as PlaceType
}

interface Geometry {
  type: 'Point'
  coordinates: number[]
}

export interface Badge {
  id: string
  name: string
  category: string
  logo: string
  url: string
}

export interface Goal {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  category: string
}

export type AcceptsNewMembers = 'yes' | 'no' | 'waitlist'

// create a type for each feature type (Farm, Depot, Initiative)
export interface Properties {
  id: string
  name: string
  city: string
  type: FeatureType
  link: string
  goals: Goal[]
  products: Product[]
  depots?: FeatureCollection
  farms?: FeatureCollection
  participation?: string
  maximumMembers?: number
  badges: Badge[]
  additionalProductInformation?: string
  actsEcological?: boolean
  economicalBehavior?: boolean
  foundedAtYear?: number
  foundedAtMonth?: number
  postalcode?: string
  acceptsNewMembers?: AcceptsNewMembers
  url?: string
  createdAt: string
  updatedAt: string
  deliveryDays?: string
  description: string
}

export interface Feature {
  type: 'Feature'
  geometry: Geometry
  properties: Properties
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: Feature[]
}

export interface ErrorResponse {
  name: string
  code?: number
  message: string
}

// TODO better types (integrate with TypeScript-based validation)

export type FarmSelectOption = { id: string; name: string }
