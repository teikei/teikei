import React from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import i18n from '../../../i18n'
import { getDetailsPath } from '../../../AppRouter'
import { featurePropType } from '../../../common/geoJsonUtils'

const farmProducts = ({ properties: { products } }) =>
  _.union(products)
    .map(({ name }) => i18n.t(`products.${name}`))
    .join(', ')

const FarmProductListEntry = (farm) => {
  const {
    properties: { id, name },
  } = farm
  return (
    <p key={id}>
      {farmProducts(farm)} – &nbsp;
      <Link to={getDetailsPath(farm, false)}>{name}</Link>
    </p>
  )
}

const DepotDescription = ({ feature }) => {
  const {
    properties: { farms, deliveryDays },
  } = feature
  return (
    <div>
      {farms.features.length > 0 && (
        <div>
          <h4>Produkte</h4>
          {farms.features.map((farm) => FarmProductListEntry(farm))}
        </div>
      )}
      {deliveryDays && (
        <div>
          <h4>Abholtage</h4>
          <p>{deliveryDays}</p>
        </div>
      )}
    </div>
  )
}

DepotDescription.propTypes = {
  feature: featurePropType.isRequired,
}

export default DepotDescription
