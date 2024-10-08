export type User = {
  id: string
  email: string
}

export type PlaceType = 'depots' | 'farms' | 'initiatives'

export type Farm = {
  id: string
}

export type Depot = {
  id: string
  farms: Farm[]
}

export type Initiative = {
  id: string
}

export type PlaceMessage = {
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

interface Properties {
  id: string
  name: string
  city: string
  type: string
  link: string
  products: Array<{ name: string; category: string }>
  depots: AssociatedPlacesProps['featureCollection']
  participation?: string
  maximumMembers?: number
}

export interface Feature {
  type: 'Feature'
  geometry: Geometry
  properties: Properties
}
