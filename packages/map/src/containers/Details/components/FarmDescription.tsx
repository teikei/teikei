import _ from 'lodash'
import i18n from '../../../i18n'
import { Feature, FeatureCollection } from '../../../types/types'
import BadgesList from './BadgesList'

interface ProductsProps {
  products: Array<{ name: string }>
  category: string
}

interface AdditionalInfoProps {
  feature: Feature
}

interface EcologicalBehaviorProps {
  feature: Feature
}

interface AssociatedPlacesProps {
  featureCollection: FeatureCollection
}

interface FarmDescriptionProps {
  feature: Feature
}

const Products = ({ products, category }: ProductsProps) => {
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

const AdditionalInfo = ({ feature }: AdditionalInfoProps) => {
  if (feature.properties.additionalProductInformation) {
    return (
      <div>
        <h4>Zusätzliche Informationen zum Lebensmittelangebot</h4>
        <p>{feature.properties.additionalProductInformation}</p>
      </div>
    )
  }
  return null
}

const EcologicalBehavior = ({ feature }: EcologicalBehaviorProps) => {
  const {
    properties: { actsEcological, economicalBehavior }
  } = feature
  if (actsEcological || economicalBehavior) {
    const actsEcologicalText = actsEcological ? (
      <li>Dieser Betrieb ist bio-zertifiziert.</li>
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

const AssociatedPlaces = ({ featureCollection }: AssociatedPlacesProps) =>
  featureCollection && featureCollection.features.length > 0 ? (
    <div>
      <h4>{i18n.t('details.connected_depots')}</h4>
      <ul>
        {featureCollection.features.map(
          ({ properties: { id, type, name } }) => (
            <li key={id} className={type.toLowerCase()}>
              <a href={`#depots/${id}`} title={name}>
                {name}
              </a>
            </li>
          )
        )}
      </ul>
    </div>
  ) : null

const Participation = (participation: string) => (
  <div>
    <h4>Mitgliederbeteiligung</h4>
    <p>{participation}</p>
  </div>
)

const MaxMembers = (members: number) => (
  <div>
    <b>Maximale Mitgliederzahl:</b> {members}
  </div>
)

const FarmDescription = ({ feature }: FarmDescriptionProps) => {
  const {
    properties: { products, depots, participation, maximumMembers }
  } = feature
  return (
    <div>
      {_.map(
        _.groupBy(products, (p) => p.category),
        (p, c) => (
          <Products products={p} category={c} />
        )
      )}
      <AdditionalInfo feature={feature} />
      <EcologicalBehavior feature={feature} />
      <AssociatedPlaces featureCollection={depots} />
      <div>
        <BadgesList category='associations' feature={feature} />
      </div>
      <div>
        <BadgesList category='certifications' feature={feature} />
      </div>

      {participation && Participation(participation)}
      {maximumMembers && MaxMembers(maximumMembers)}
    </div>
  )
}

export default FarmDescription
