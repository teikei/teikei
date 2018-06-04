import React from 'react'
import PropTypes from 'prop-types'
import { getDetailsPath, history } from '../AppRouter'
import i18n from '../i18n'

const translatedProducts = feature => {
  // TODO
  // const {
  //   properties: { animal_products, vegetable_products, beverages }
  // } = feature
  // const resultText = animal_products
  //   .concat(vegetable_products)
  //   .concat(beverages)
  //   .filter(p => p !== null)
  //   .map(p => i18n.t(`products.${p}`))
  //   .join(', ')
  //
  // return resultText ? <p>{resultText}</p> : ''
  return ''
}

const FeaturePopup = ({ feature }) => {
  const {
    properties: { name, city, type }
  } = feature
  return (
    <div className="map-popup">
      <h3>{name}</h3>
      <em>{city}</em>
      {type === 'Farm' && translatedProducts(feature)}
      <a
        className="details-link"
        href={history.createHref(getDetailsPath(feature))}
      >
        Details
      </a>
    </div>
  )
}

FeaturePopup.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    type: PropTypes.string,
    city: PropTypes.string,
    products: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
}

export default FeaturePopup
