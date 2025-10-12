import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import BadgesList from '~/components/details/BadgesList'
import type { Feature, FeatureCollection } from '~/types/types'

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
  featureCollection?: FeatureCollection
}

interface FarmDescriptionProps {
  feature: Feature
}

const Products = ({ products, category }: ProductsProps) => {
  const { t } = useTranslation()
  if (products && products.length > 0) {
    return (
      <div>
        <h4>{t(`productcategories.${category}`)}</h4>
        <ul>
          {products.map(({ name }) => (
            <li key={name}>{t(`products.${name}`)}</li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

const AdditionalInfo = ({ feature }: AdditionalInfoProps) => {
  const { t } = useTranslation()
  if (feature.properties.additionalProductInformation) {
    return (
      <div>
        <h4>{t('places.farmdescription.additionalinfo')}</h4>
        <p>{feature.properties.additionalProductInformation}</p>
      </div>
    )
  }
  return null
}

const EcologicalBehavior = ({ feature }: EcologicalBehaviorProps) => {
  const { t } = useTranslation()
  const {
    properties: { actsEcological, economicalBehavior }
  } = feature
  if (actsEcological || economicalBehavior) {
    const actsEcologicalText = actsEcological ? (
      <li>{t('places.farmdescription.biocertification')}</li>
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
        <h4>{t('places.farmdescription.economicalbehavior')}</h4>
        <ul>
          {actsEcologicalText}
          {ecologicalBehaviorText}
        </ul>
      </div>
    )
  }
  return null
}

const AssociatedPlaces = ({
  featureCollection = undefined
}: AssociatedPlacesProps) => {
  const { t } = useTranslation()
  return featureCollection && featureCollection.features.length > 0 ? (
    <div>
      <h4>{t('details.connected_depots')}</h4>
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
}

const Participation = (participation: string) => {
  const { t } = useTranslation()
  return (
    <div>
      <h4>{t('places.farmdescription.participation')}</h4>
      <p>{participation}</p>
    </div>
  )
}

const MaxMembers = (members: number) => {
  const { t } = useTranslation()
  return (
    <div>
      <b>{t('places.farmdescription.maximummembers')}</b> {members}
    </div>
  )
}

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
