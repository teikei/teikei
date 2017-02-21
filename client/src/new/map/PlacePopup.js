import React from 'react'

const translatedProducts = (place) => {
  if (place.type === 'Farm') {
    return place.animal_products
      .concat(place.vegetable_products)
      .concat(place.beverages)
      .filter(p => p !== null)
      .map(p => I18n.t(`products.${p}`))
      .join(', ')
  }
  return ''
}

const placeUrl = ({ type, id }) => (
  `/new/${type.toLowerCase()}s/${id}`
)

const PlacePopup = ({ place }) => (
  <div className="map-popup">
    <h3>{place.name}</h3>
    <em>{place.city}</em>
    <p>{translatedProducts(place)}</p>
    <a className="details" href={placeUrl(place)}>Details</a>
  </div>
)

PlacePopup.propTypes = {
  place: React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
    type: React.PropTypes.string,
    city: React.PropTypes.string,
    products: React.PropTypes.arrayOf(React.PropTypes.string),
  }).isRequired,
};

export default PlacePopup
