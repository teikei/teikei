import _ from 'lodash'
import Alert from 'react-s-alert'

import { getLatitude, getLongitude } from './geoJsonUtils'
import { initialValues as joiInitialValues } from './validation'

export const filterFarms = (features: any) => {
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

export const handleEditorError = (error: { code: number; message: string }) => {
  if (error.code === 401) {
    Alert.error(
      'Dein Eintrag konnte nicht gespeichert werden. Bitte überprüfe, ob du angemeldet bist.'
    )
  } else if (error.code === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
  } else {
    Alert.error(
      `Dein Eintrag konnte nicht gespeichert werden / ${error.message}`
    )
  }
}
