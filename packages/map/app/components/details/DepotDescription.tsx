import i18n from 'i18next'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getDetailsPath } from '~/lib/routeUtils'
import type { Feature } from '~/types/types'

interface DepotDescriptionProps {
  feature: Feature
}

const farmProducts = ({
  properties: { products }
}: {
  properties: { products: Array<{ name: string }> }
}) =>
  _.union(products)
    .map(({ name }) => i18n.t(`products.${name}`))
    .join(', ')

const FarmProductListEntry = (farm: {
  properties: { id: string; name: string; products: Array<{ name: string }> }
}) => {
  const {
    properties: { id, name }
  } = farm
  return (
    <p key={id}>
      {farmProducts(farm)} – &nbsp;
      <Link to={getDetailsPath(farm, false)}>{name}</Link>
    </p>
  )
}

const DepotDescription = ({ feature }: DepotDescriptionProps) => {
  const {
    properties: { farms, deliveryDays }
  } = feature
  const { t } = useTranslation()
  return (
    <div>
      {farms && farms.features.length > 0 && (
        <div>
          <h4>{t('places.depotdescription.products')}</h4>
          {farms.features.map((farm) => FarmProductListEntry(farm))}
        </div>
      )}
      {deliveryDays && (
        <div>
          <h4>{t('places.depotdescription.deliverydays')}</h4>
          <p>{deliveryDays}</p>
        </div>
      )}
    </div>
  )
}

export default DepotDescription
