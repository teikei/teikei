import React from 'react'
import _ from 'underscore'
import i18n from '../../i18n'

const farmProducts = farm => _.union(
  farm.animal_products,
  farm.vegetable_products,
  farm.beverages,
).map(p => i18n.t(`products.${p}`)).join(', ')

const FarmProductListEntry = ({ farm }) => (
  <li>
    {farmProducts(farm)}&nbsp;<a href="#places/{farm.id}/details" title="{farm.name}">{farm.name}</a>
  </li>
)

const FarmProductList = ({ farms }) => {
  if (farms.length > 0) {
    return (
      <div>
        <h4>Produkte</h4>
        <ul>
          {farms.map(f => <FarmProductListEntry farm={f} />)}
        </ul>
      </div>
    )
  }
  return 'Dieses Depot hat noch keine Produkte'
}

const DeliveryDays = ({ place }) => {
  if (place.delivery_days) {
    return (
      <div>
        <h4>Abholtage</h4>
        <p>{place.delivery_days}</p>
      </div>
    )
  }
  return ''
}

const DepotDescription = ({ place }) => {
  const associatedFarms = place.places.filter(p => p.type === 'Farm')
  return (
    <div>
      <FarmProductList farms={associatedFarms} />
      <DeliveryDays place={place} />
    </div>
  )
}

FarmProductListEntry.propTypes = {
  farm: React.PropTypes.object.isRequired,
};

FarmProductList.propTypes = {
  farms: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

DeliveryDays.propTypes = {
  place: React.PropTypes.object.isRequired,
};

DepotDescription.propTypes = {
  place: React.PropTypes.object.isRequired,
};

export default DepotDescription
