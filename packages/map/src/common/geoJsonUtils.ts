import _ from 'lodash'

export const getLongitude = (feature) =>
  _.get(feature, 'geometry.coordinates[0]')
export const getLatitude = (feature) =>
  _.get(feature, 'geometry.coordinates[1]')
