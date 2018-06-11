import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import _ from 'lodash'
import i18n from '../../i18n'
import { getMapPositionPath } from '../../AppRouter'
import featureToPlace from '../../common/migrationUtils'

const farmProducts = farm =>
  _.union(farm.products)
    .map(({ name }) => i18n.t(`products.${name}`))
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
  const farms = place.places.map(featureToPlace).filter(p => p.type === 'Farm')
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
