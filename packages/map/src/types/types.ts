/* eslint-disable no-use-before-define */

export interface User {
  id: string
  name: string
  email: string
}

// TODO unify PlaceType and FeatureType
export type PlaceType = 'depots' | 'farms' | 'initiatives'
export type FeatureType = 'Depot' | 'Farm' | 'Initiative'

interface Geometry {
  type: 'Point'
  coordinates: number[]
}

export interface Badge {
  id: string
  category: string
  logo: string
  url: string
}

interface Goal {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  category: string
}

export type AcceptsNewMembers = 'yes' | 'no' | 'waitlist'

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

// ERROR

export interface ErrorResponse {
  code: number
  message: string
}

// FORMS

// TODO better types (integrate with TypeScript-based validation)

export type FarmSelectOption = { id: string; name: string }
