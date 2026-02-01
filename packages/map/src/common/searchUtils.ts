import _ from 'lodash'

export interface AddressItem {
  street?: string
  houseNumber?: string
  city?: string
}

export const addressOf = ({ street, houseNumber }: AddressItem) =>
  [street, houseNumber].join(' ').trim()

export const labelOf = ({ street, houseNumber, city }: AddressItem) =>
  _.compact([addressOf({ street, houseNumber }), city]).join(', ')
