import i18n from 'i18next'
import { useTranslation } from 'react-i18next'

import { getDetailsPath } from '../../common/routeUtils'

interface Product {
  category: string
  name: string
}

interface FeatureProperties {
  id: string
  name: string
  type: string
  city: string
  products?: Product[]
  goals?: { name: string }[]
}

interface Feature {
  properties: FeatureProperties
}

interface PlacePopupProps {
  feature: Feature
}

const translatedProducts = (feature: Feature) => {
  const resultText = feature.properties.products
    ? feature.properties.products
        .filter((p) => p !== null)
        .map((p) => i18n.t(`products.${p.name}`))
        .join(', ')
    : ''

  return resultText ? <p>{resultText}</p> : null
}

const translatedGoals = (feature: Feature) => {
  const resultText = feature.properties.goals
    ? feature.properties.goals
        .filter((p) => p !== null)
        .map((p) => i18n.t(`forms.labels.goals.${p.name}`))
        .join(' - ')
    : ''

  return resultText ? <p>{resultText}</p> : null
}

const PlacePopup = ({ feature }: PlacePopupProps) => {
  const { t } = useTranslation()
  const {
    properties: { name, city, type }
  } = feature
  return (
    <div className='map-popup'>
      <h3>{name}</h3>
      <em>{city}</em>
      {type === 'Farm' && translatedProducts(feature)}
      {type === 'Initiative' && translatedGoals(feature)}
      <a className='details-link' href={getDetailsPath(feature)}>
        {t('places.popup.details')}
      </a>
    </div>
  )
}

export default PlacePopup
