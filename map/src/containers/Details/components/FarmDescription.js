import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import i18n from '../../../i18n'
import { featurePropType } from '../../../common/geoJsonUtils'

const Products = ({ products, category }) => {
  if (products && products.length > 0) {
    return (
      <div>
        <h4>{i18n.t(`productcategories.${category}`)}</h4>
        <ul>
          {products.map(({ name }) => (
            <li key={name}>{i18n.t(`products.${name}`)}</li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

const AdditionalInfo = ({ feature }) => {
  if (feature.additionalProductInformation) {
    return (
      <div>
        <h4>Zusätzliche Informationen zum Lebensmittelangebot</h4>
        <p>{feature.additionalProductInformation}</p>
      </div>
    )
  }
  return null
}

const EcologicalBehavior = ({ feature }) => {
  const {properties: {actsEcological, economicalBehavior}} = feature
  if (actsEcological || economicalBehavior) {
    const actsEcologicalText = actsEcological ? (
      <li>Dieser Hof wirtschaftet ökologisch.</li>
    ) : (
      ''
    )
    const ecologicalBehaviorText = economicalBehavior ? (
      <li>{economicalBehavior}</li>
    ) : (
      ''
    )
    return (
      <div>
        <h4>Wirtschaftsweise</h4>
        <ul>
          {actsEcologicalText}
          {ecologicalBehaviorText}
        </ul>
      </div>
    )
  }
  return null
}

const AssociatedPlaces = ({ featureCollection }) => {
  debugger
  return (featureCollection && featureCollection.features.length > 0) ? (
    <div>
      <h4>{i18n.t('details.connected_depots')}</h4>
      <ul>
        {featureCollection.features.map(({ properties: { id, type, name } }) => (
          <li key={id} className={type.toLowerCase()}>
            <a href={`#depots/${id}`} title={name}>
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : null
}

const Participation = participation => (
  <div>
    <h4>Mitgliederbeteiligung</h4>
    <p>{participation}</p>
  </div>
)

const MaxMembers = members => (
  <div>
    <b>Maximale Mitgliederzahl:</b> {members}
  </div>
)

const FarmDescription = ({ feature }) => {
  const {properties: {products, depots, participation, maximumMembers}} = feature
  debugger
  return (
    <div>
      {_.map(_.groupBy(products, p => p.category), (p, c) => (
        <Products products={p} category={c}/>
      ))}
      <AdditionalInfo feature={feature}/>
      <EcologicalBehavior feature={feature}/>
      <AssociatedPlaces featureCollection={depots}/>

      {participation && Participation(participation)}
      {maximumMembers && MaxMembers(maximumMembers)}
    </div>
  )
}

AdditionalInfo.propTypes = {
  feature: PropTypes.shape({
    additionalProductInformation: PropTypes.string
  }).isRequired
}

EcologicalBehavior.propTypes = {
  feature: featurePropType.isRequired
}

AssociatedPlaces.propTypes = {
  features: PropTypes.arrayOf(featurePropType).isRequired
}

Products.propTypes = {
  products: PropTypes.arrayOf(PropTypes.string).isRequired,
  category: PropTypes.string.isRequired
}

FarmDescription.propTypes = {
  feature: PropTypes.shape({
    vegetableProducts: PropTypes.arrayOf(PropTypes.string),
    animalProducts: PropTypes.arrayOf(PropTypes.string),
    beverages: PropTypes.arrayOf(PropTypes.string),
    participation: PropTypes.string,
    maximumMembers: PropTypes.number
  }).isRequired
}

export default FarmDescription
