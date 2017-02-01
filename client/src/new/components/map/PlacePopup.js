import React from 'react'
import { Popup } from 'react-leaflet'
import browserHistory from '../../browserHistory'

const translatedProducts = (place) => {
  if (place.type === 'Farm') {
    return place.animal_products.concat(place.vegetable_products).concat(place.beverages)
      .filter(p => p !== null)
      .map(p => I18n.t(`products.${p}`))
      .join(', ')
  }
  return ''
}

const PlacePopup = props => (
  <Popup>
    <div className="map-popup">
      <h3>{props.place.name}</h3>
      <em>{props.place.city}</em>
      <p>
        {translatedProducts(props.place)}
      </p>
      <button className="details" title="Öffnet die Details dieses Eintrags" onClick={() => browserHistory.push(`/new/${props.place.type.toLowerCase()}s/${props.place.id}`)}>Details</button>
    </div>
  </Popup>
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
