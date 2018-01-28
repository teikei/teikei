import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import _ from 'underscore'
import i18n from '../../i18n'
import { getMapPositionPath } from '../../AppRouter'

const farmProducts = farm =>
  _.union(farm.animal_products, farm.vegetable_products, farm.beverages)
    .map(p => i18n.t(`products.${p}`))
    .join(', ')

const FarmProductListEntry = farm => (
  <p key={farm.id}>
    {farmProducts(farm)} – &nbsp;<Link to={getMapPositionPath(farm)}>
      {farm.name}
    </Link>
  </p>
)

const FarmProductList = farms => (
  <div>
    <h4>Produkte</h4>
    {farms.map(farm => FarmProductListEntry(farm))}
  </div>
)

const DeliveryDays = place => (
  <div>
    <h4>Abholtage</h4>
    <p>{place.delivery_days}</p>
  </div>
)

const DepotDescription = ({ place }) => {
  const farms = place.places.filter(p => p.type === 'Farm')
  return (
    <div>
      {farms.length > 0 && FarmProductList(farms)}
      {place.delivery_days && DeliveryDays(place)}
    </div>
  )
}

DepotDescription.propTypes = {
  place: PropTypes.shape({
    places: PropTypes.arrayOf(
      PropTypes.shape({
        animal_products: PropTypes.arrayOf(PropTypes.string),
        vegetable_products: PropTypes.arrayOf(PropTypes.string),
        beverages: PropTypes.arrayOf(PropTypes.string)
      })
    ),
    delivery_days: PropTypes.string
  }).isRequired
}

export default DepotDescription
