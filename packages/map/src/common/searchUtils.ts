import _ from 'lodash'

export interface AddressItem {
  street?: string
  houseNumber?: string
  city?: string
}

export const addressOf = ({ street, houseNumber }: AddressItem) =>
  [street, houseNumber].join(' ').trim()

export const cityOf = ({ city }: AddressItem) => (city ?? '').trim()

export const labelOf = (item: AddressItem) =>
  _.compact([addressOf(item), cityOf(item)]).join(', ')
