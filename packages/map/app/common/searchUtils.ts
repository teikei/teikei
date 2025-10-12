import _ from 'lodash'

type AddressLike = {
  street?: string | null
  houseNumber?: string | null
  postalCode?: string | null
  city?: string | null
}

export const addressOf = ({ street = '', houseNumber = '' }: AddressLike) =>
  [street, houseNumber].join(' ').trim()

export const cityOf = ({ postalCode = '', city = '' }: AddressLike) =>
  [postalCode, city].join(' ').trim()

export const labelOf = (item: AddressLike) =>
  _.compact([addressOf(item), cityOf(item)]).join(', ')
