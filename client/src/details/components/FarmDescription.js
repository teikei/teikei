import React, { PropTypes } from 'react'
import i18n from '../../i18n'

const Products = ({ products, title, type }) => {
  if (products && products.length > 0) {
    return (
      <div>
        <h4>{title}</h4>
        <ul>
          {products.map(p => (<li key={p} className={`${p} ${type}`}>{i18n.t(`products.${p}`)}</li>))}
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
    const actsEcological = place.acts_ecological ? <li>Dieser Hof wirtschaftet ökologisch.</li> : ''
    const ecologicalBehavior = place.economical_behavior ? <li>{place.economical_behavior}</li> : ''
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
              <a href={`#places/${p.id}/details`} title={p.name}>{p.name}</a>
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
    <Products products={place.vegetable_products} title={'Pflanzliche Produkte'} type={'vegetable'} />
    <Products products={place.animal_products} title={'Tierische Produkte'} type={'animal'} />
    <Products products={place.beverages} title={'Getränke'} type={'beverage'} />
    <AdditionalInfo place={place} />
    <EcologicalBehavior place={place} />
    <AssociatedPlaces places={place.places} />

    {place.participation && Participation(place.participation)}
    {place.maximum_members && MaxMembers(place.maximum_members)}
  </div>
)

AdditionalInfo.propTypes = {
  place: PropTypes.shape({
    additional_product_information: PropTypes.string,
  }).isRequired,
};

EcologicalBehavior.propTypes = {
  place: PropTypes.shape({
    acts_ecological: PropTypes.bool,
    economical_behavior: PropTypes.string,
  }).isRequired,
};

AssociatedPlaces.propTypes = {
  places: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Products.propTypes = {
  products: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

FarmDescription.propTypes = {
  place: PropTypes.shape({
    vegetable_products: PropTypes.arrayOf(PropTypes.string),
    animal_products: PropTypes.arrayOf(PropTypes.string),
    beverages: PropTypes.arrayOf(PropTypes.string),
    participation: PropTypes.string,
    maximum_members: PropTypes.number,
  }).isRequired,
};

export default FarmDescription
