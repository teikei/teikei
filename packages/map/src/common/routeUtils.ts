import { Feature } from '../types/types'
import config from '../configuration'

export const getDetailsPath = (feature: Feature, withBaseUrl = true) => {
  const prefix = withBaseUrl ? config.baseUrl : ''
  if (feature.type === 'Feature') {
    const {
      properties: { id, type }
    } = feature
    return `${prefix}/${type.toLowerCase()}s/${id}`
  }
  if (feature.type === 'location') {
    return `${prefix}/locations/${feature.id}`
  }
  const { id, type } = feature
  return `${prefix}/${type}s/${id}`
}
export const getEditPath = (feature: Feature) =>
  `${getDetailsPath(feature, false)}/edit`
export const getDeletePath = (feature: Feature) =>
  `${getDetailsPath(feature, false)}/delete`
