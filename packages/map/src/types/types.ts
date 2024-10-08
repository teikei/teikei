/* eslint-disable no-use-before-define */

export interface User {
  id: string
  email: string
}

// TODO unify PlaceType and FeatureType
export type PlaceType = 'depots' | 'farms' | 'initiatives'
export type FeatureType = 'Depot' | 'Farm' | 'Initiative'

export interface Farm {
  id: string
}

export interface Depot {
  id: string
  farms: Farm[]
}

export interface Initiative {
  id: string
}

export interface PlaceMessage {
  id: string
  senderEmail: string
  senderName: string
  text: string
  type: PlaceType
}

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

interface Properties {
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
