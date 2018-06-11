import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import i18n from '../../i18n'
import featureToPlace from '../../common/migrationUtils'

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

const AdditionalInfo = ({ place }) => {
  if (place.additional_product_information) {
    return (
      <div>
        <h4>Zusätzliche Informationen zum Lebensmittelangebot</h4>
        <p>{place.additional_product_information}</p>
      </div>
    )
  }
  return null
}

const EcologicalBehavior = ({ place }) => {
  if (place.acts_ecological || place.economical_behavior) {
    const actsEcological = place.acts_ecological ? (
      <li>Dieser Hof wirtschaftet ökologisch.</li>
    ) : (
      ''
    )
    const ecologicalBehavior = place.economical_behavior ? (
      <li>{place.economical_behavior}</li>
    ) : (
      ''
    )
    return (
      <div>
        <h4>Wirtschaftsweise</h4>
        <ul>
          {actsEcological}
          {ecologicalBehavior}
        </ul>
      </div>
    )
  }
  return null
}

const AssociatedPlaces = ({ places }) => {
  if (places.length > 0) {
    return (
      <div>
        <h4>{i18n.t('details.connected_depots')}</h4>
        <ul>
          {places.map(featureToPlace).map(p => (
            <li className={p.type.toLowerCase()}>
              <a href={`#places/${p.id}/details`} title={p.name}>
                {p.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return null
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

const FarmDescription = ({ place }) => {
  const { products, places, participation, maximum_members } = place
  return (
    <div>
      {_.map(_.groupBy(products, p => p.category), (p, c) => (
        <Products products={p} category={c} />
      ))}
      <AdditionalInfo place={place} />
      <EcologicalBehavior place={place} />
      <AssociatedPlaces places={places} />
      {participation && Participation(participation)}
      {maximum_members && MaxMembers(maximum_members)}
    </div>
  )
}

AdditionalInfo.propTypes = {
  place: PropTypes.shape({
    additional_product_information: PropTypes.string
  }).isRequired
}

EcologicalBehavior.propTypes = {
  place: PropTypes.shape({
    acts_ecological: PropTypes.bool,
    economical_behavior: PropTypes.string
  }).isRequired
}

AssociatedPlaces.propTypes = {
  places: PropTypes.arrayOf(PropTypes.object).isRequired
}

Products.propTypes = {
  products: PropTypes.arrayOf(PropTypes.string).isRequired,
  category: PropTypes.string.isRequired
}

FarmDescription.propTypes = {
  place: PropTypes.shape({
    vegetable_products: PropTypes.arrayOf(PropTypes.string),
    animal_products: PropTypes.arrayOf(PropTypes.string),
    beverages: PropTypes.arrayOf(PropTypes.string),
    participation: PropTypes.string,
    maximum_members: PropTypes.number
  }).isRequired
}

export default FarmDescription
