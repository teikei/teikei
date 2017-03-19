import React from 'react'
import i18n from '../../i18n'

const Products = ({ products, title, type }) => {
  if (products && products.length > 0) {
    return (
      <div>
        <h4>{title}</h4>
        <ul>
          {products.map(p => (<li key={p.id} className={`${p} ${type}`}>{i18n.t(`products.${p}`)}</li>))}
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

const FarmDescription = ({ place }) => (
  <div>
    <Products products={place.vegetable_products} title={'Pflanzliche Produkte'} type={'vegetable'} />
    <Products products={place.animal_products} title={'Tierische Produkte'} type={'animal'} />
    <Products products={place.beverages} title={'Getränke'} type={'beverage'} />
    <AdditionalInfo place={place} />
    <EcologicalBehavior place={place} />
    <AssociatedPlaces places={place.places} />
  </div>
)

Products.propTypes = {
  products: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  title: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
};

AdditionalInfo.propTypes = {
  place: React.PropTypes.object.isRequired,
};

EcologicalBehavior.propTypes = {
  place: React.PropTypes.object.isRequired,
};

AssociatedPlaces.propTypes = {
  places: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

FarmDescription.propTypes = {
  place: React.PropTypes.object.isRequired,
};

export default FarmDescription
