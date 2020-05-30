import _ from 'lodash'

export const addressOf = ({ street, houseNumber }) =>
  [street, houseNumber].join(' ').trim()

export const cityOf = ({ postalCode, city }) =>
  [postalCode, city].join(' ').trim()

export const labelOf = (item) =>
  _.compact([addressOf(item), cityOf(item)]).join(', ')
