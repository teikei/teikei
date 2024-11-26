import i18n from 'i18next'
import _ from 'lodash'

import { ErrorResponse, FarmSelectOption, Feature } from '../types/types'
import { getLatitude, getLongitude } from './geoJsonUtils'
import { initialValues as joiInitialValues } from './validation'

export const filterFarms = (features: Feature[]): FarmSelectOption[] => {
  const farms = features.filter((p: any) => p.properties.type === 'Farm')
  return farms.map(({ properties: { id, name } }: any) => ({
    id,
    name
  }))
}

export const getInitialValues = (feature: any, type: any, mode: any) => {
  if (mode === 'update') {
    return feature
      ? _.pick(
          {
            ...feature.properties,
            ...(feature.properties.farms && {
              farms: feature.properties.farms.features.map(
                ({ properties: { id, name } }: any) => ({
                  id,
                  name
                })
              )
            }),
            ...(feature.properties.goals && {
              goals: feature.properties.goals.map(({ id }: any) => id)
            }),
            ...(feature.properties.products && {
              products: feature.properties.products.map(({ id }: any) => id)
            }),
            ...(feature.properties.badges && {
              badges: feature.properties.badges.map(({ id }: any) => id)
            }),
            latitude: getLatitude(feature),
            longitude: getLongitude(feature)
          },
          ['id', ..._.keys((joiInitialValues as any)[type])]
        )
      : {}
  }
  return (joiInitialValues as any)[type]
}

export const getErrorMessage = (error: ErrorResponse) => {
  if (error.code === 401) {
    return i18n.t('errors.unauthorized')
  }
  if (error.code === 403) {
    return i18n.t('errors.forbidden')
  }
  if (error.code === 422) {
    return i18n.t('errors.bad_request')
  }
  if (error.code === 404) {
    return i18n.t('errors.not_found')
  }
  if (error.code === 500) {
    return i18n.t('errors.server_error')
  }
  return i18n.t('errors.general_error')
}
