import React from 'react'
import PropTypes from 'prop-types'
import { getDetailsPath, history } from '../../AppRouter'
import i18n from '../../i18n'

const translatedProducts = feature => {
  const resultText = feature.properties.products
    ? feature.properties.products
        .filter(p => p !== null)
        .map(p => i18n.t(`products.${p.name}`))
        .join(', ')
    : ''

  return resultText ? <p>{resultText}</p> : ''
}

const translatedGoals = feature => {
  const resultText = feature.properties.goals
    ? feature.properties.goals
      .filter(p => p !== null)
      .map(p => i18n.t(`forms.labels.goals.${p.name}`))
      .join(' - ')
    : ''

  return resultText ? <p>{resultText}</p> : ''
}

const PlacePopup = ({ feature }) => {
  const {
    properties: { name, city, type }
  } = feature
  return (
    <div className="map-popup">
      <h3>{name}</h3>
      <em>{city}</em>
      {type === 'Farm' && translatedProducts(feature)}
      {type === 'Initiative' && translatedGoals(feature)}
      <a
        className="details-link"
        href={history.createHref(getDetailsPath(feature))}
      >
        Details
      </a>
    </div>
  )
}

PlacePopup.propTypes = {
  feature: PropTypes.shape({
    properties: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      type: PropTypes.string,
      city: PropTypes.string,
      products: PropTypes.arrayOf(
        PropTypes.shape({
          category: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired
        })
      )
    })
  }).isRequired
}

export default PlacePopup
