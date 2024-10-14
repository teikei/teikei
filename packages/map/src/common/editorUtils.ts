import _ from 'lodash'

import { getLatitude, getLongitude } from './geoJsonUtils'
import { initialValues as joiInitialValues } from './validation'
import { ErrorResponse, FarmSelectOption, Feature } from '../types/types'

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
    return 'Du hast keine Berechtigung für diese Aktion. Bitte überprüfe, ob du angemeldet bist.'
  }
  if (error.code === 403) {
    return 'Du hast keine Berechtigung für diese Aktion.'
  }
  if (error.code === 422) {
    return 'Bitte überprüfe deine Eingaben.'
  }
  if (error.code === 404) {
    return 'Der Eintrag konnte nicht gefunden werden.'
  }
  if (error.code === 500) {
    return 'Ein technischer Fehler ist aufgetreten. Bitte versuche es später noch einmal.'
  }
  return 'Ein Fehler ist aufgetreten.'
}
