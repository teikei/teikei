import config from '~/config/app-configuration'
import type { Feature } from '~/types/types'

type LocationFeature = { type: 'location'; id: string }
type SimpleFeature = { id: string; type: string }
type NavigableFeature = Feature | LocationFeature | SimpleFeature

export const getDetailsPath = (
  feature: NavigableFeature,
  withBaseUrl = true
): string => {
  const prefix = withBaseUrl ? config.baseUrl : ''

  if ('properties' in feature && feature.type === 'Feature') {
    const {
      properties: { id, type }
    } = feature
    return `${prefix}/${type.toLowerCase()}s/${id}`
  }

  if ('type' in feature && feature.type === 'location') {
    return `${prefix}/locations/${feature.id}`
  }

  if ('id' in feature && 'type' in feature) {
    return `${prefix}/${String(feature.type).toLowerCase()}s/${feature.id}`
  }

  return prefix
}

export const getEditPath = (feature: NavigableFeature) =>
  `${getDetailsPath(feature, false)}/edit`
export const getDeletePath = (feature: NavigableFeature) =>
  `${getDetailsPath(feature, false)}/delete`
