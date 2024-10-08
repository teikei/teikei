export interface User {
  id: string
  email: string
}

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
  type: string // TODO migrate to PlaceType (needs backend change)
}

interface Geometry {
  type: 'Point'
  coordinates: number[]
}

interface Badge {
  id: string
  category: string
  logo: string
  url: string
}

export interface Feature {
  type: 'Feature'
  geometry: Geometry
  properties: Properties
}

interface Goal {
  id: string
  name: string
}

interface Properties {
  id: string
  name: string
  city: string
  type: string
  link: string
  goals: Goal[]
  products: Array<{ name: string; category: string }>
  depots: FeatureCollection
  participation?: string
  maximumMembers?: number
  badges: Badge[]
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: Feature[]
}
