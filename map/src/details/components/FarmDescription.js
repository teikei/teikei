import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import i18n from '../../i18n'

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
  if (place.additionalProductInformation) {
    return (
      <div>
        <h4>Zusätzliche Informationen zum Lebensmittelangebot</h4>
        <p>{place.additionalProductInformation}</p>
      </div>
    )
  }
  return null
}

const EcologicalBehavior = ({ place }) => {
  if (place.actsEcological || place.economicalBehavior) {
    const actsEcological = place.actsEcological ? (
      <li>Dieser Hof wirtschaftet ökologisch.</li>
    ) : (
      ''
    )
    const ecologicalBehavior = place.economicalBehavior ? (
      <li>{place.economicalBehavior}</li>
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
          {places.map(p => (
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

const FarmDescription = ({ place }) => (
  <div>
    {_.map(_.groupBy(place.products, p => p.category), (p, c) => (
      <Products products={p} category={c} />
    ))}
    <AdditionalInfo place={place} />
    <EcologicalBehavior place={place} />
    <AssociatedPlaces places={place.places} />

    {place.participation && Participation(place.participation)}
    {place.maximumMembers && MaxMembers(place.maximumMembers)}
  </div>
)

AdditionalInfo.propTypes = {
  place: PropTypes.shape({
    additionalProductInformation: PropTypes.string
  }).isRequired
}

EcologicalBehavior.propTypes = {
  place: PropTypes.shape({
    actsEcological: PropTypes.bool,
    economicalBehavior: PropTypes.string
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
    vegetableProducts: PropTypes.arrayOf(PropTypes.string),
    animalProducts: PropTypes.arrayOf(PropTypes.string),
    beverages: PropTypes.arrayOf(PropTypes.string),
    participation: PropTypes.string,
    maximumMembers: PropTypes.number
  }).isRequired
}

export default FarmDescription
