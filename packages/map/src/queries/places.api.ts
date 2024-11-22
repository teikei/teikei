// TODO replace client with plain fetch
import ky from 'ky'
import configuration from '../configuration.ts'
import {
  FeatureType,
  PlaceType,
  placeTypeToEntryType,
  Properties
} from '../types/types'
import { client } from './clients'

const { apiBaseUrl } = configuration

interface Farm {
  id: string
}

interface Depot {
  farms: Farm[]
}

export const mapDepotToApiParams = (depot: Depot) => ({
  ...depot,
  farms: depot.farms ? depot.farms.map((p: Farm) => p.id) : []
})

export async function getEntries() {
  return ky.get(`${apiBaseUrl}/entries`).json()
}

export async function getMyEntries() {
  return client.service('entries').find({ query: { mine: true } })
}

interface GetMyEntryParams {
  type: PlaceType
  id: string
}

export async function getMyEntry(getMyEntryParams: GetMyEntryParams) {
  const { type, id } = getMyEntryParams
  const ownershipCheck = await client
    .service('entries')
    .find({ query: { mine: true, type: placeTypeToEntryType(type), id } })
  if (ownershipCheck.features.length !== 1) {
    throw new Error('Unauthorized')
  }
  return client.service(type).get(id)
}

interface GetPlaceParams {
  type: PlaceType
  id: string
}

export async function getPlace(getPlaceParams: GetPlaceParams) {
  const { type, id } = getPlaceParams
  return client.service(type).get(id)
}

interface DeletePlaceParams {
  type: PlaceType
  id: string
}

export async function deletePlace(deletePlaceParams: DeletePlaceParams) {
  const { type, id } = deletePlaceParams
  return client.service(type).remove(id)
}

export async function getProducts() {
  return client.service('products').find()
}

export async function getGoals() {
  return client.service('goals').find()
}

export async function getBadges() {
  return client.service('badges').find()
}

// TODO
export type UpdateDepotParams = Properties

export async function updateDepot(updateDepotParams: UpdateDepotParams) {
  const { id } = updateDepotParams
  return client
    .service('depots')
    .patch(id, mapDepotToApiParams(updateDepotParams))
}

// TODO
export type CreateDepotParams = Omit<UpdateDepotParams, 'id'>

export async function createDepot(createDepotParams: CreateDepotParams) {
  return client.service('depots').create(mapDepotToApiParams(createDepotParams))
}

// TODO
export type UpdateFarmParams = Properties

export async function updateFarm(updateFarmParams: UpdateFarmParams) {
  const { id } = updateFarmParams
  return client.service('farms').patch(id, updateFarmParams)
}

export type CreateFarmParams = Omit<UpdateFarmParams, 'id'>

export async function createFarm(farm: CreateFarmParams) {
  return client.service('farms').create(farm)
}

// TODO
export type UpdateInitiativeParams = Properties

export async function updateInitiative(
  updateInitiativeParams: UpdateInitiativeParams
) {
  const { id } = updateInitiativeParams
  return client.service('initiatives').patch(id, updateInitiativeParams)
}

export type CreateInitiativeParams = Omit<UpdateInitiativeParams, 'id'>

export async function createInitiative(
  createInitiativeParams: CreateInitiativeParams
) {
  return client.service('initiatives').create(createInitiativeParams)
}

export interface sendPlaceMessageParams {
  id: string
  senderEmail: string
  senderName: string
  text: string
  type: FeatureType
}

export async function sendPlaceMessage(
  sendPlaceMessageParams: sendPlaceMessageParams
) {
  return client.service('entrycontactmessage').create(sendPlaceMessageParams)
}
