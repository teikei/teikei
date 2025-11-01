import type { Feature } from '~/types/types'

import DepotDescription from './depot-description'
import FarmDescription from './farm-description'
import InitiativeDescription from './initiative-description'

const getDescriptionDetails = (feature: Feature) => {
  switch (feature.properties.type) {
    case 'Farm':
      return <FarmDescription feature={feature} />
    case 'Depot':
      return <DepotDescription feature={feature} />
    case 'Initiative':
      return <InitiativeDescription feature={feature} />
    default:
      return <div />
  }
}

interface PlaceDescriptionProps {
  feature: Feature
}

const PlaceDescription = ({ feature }: PlaceDescriptionProps) => (
  <div>
    <p>{feature.properties.description}</p>
    {getDescriptionDetails(feature)}
  </div>
)

export default PlaceDescription
