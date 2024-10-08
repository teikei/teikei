import FarmDescription from './FarmDescription'
import DepotDescription from './DepotDescription'
import InitiativeDescription from './InitiativeDescription'
import { Feature } from '../../../types/types'

// TODO implement: image display and upload

// const IMAGE_PLACEHOLDER = '/assets/placeimage-placeholder.png'
//
// const getImageUrl = (place) => {
//   let imageUrl = IMAGE_PLACEHOLDER
//   if (place.image) {
//     imageUrl = place.image.url
//   }
//   return imageUrl
// }
//
// const getProfilePicture = (place) => {
//   switch (place.type) {
//     case 'Farm':
//       return <img className="profile-picture" alt="" src={getImageUrl(place)} />
//     default:
//       return ''
//   }
// }

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
    {/* getProfilePicture(place) */}
    <p>{feature.properties.description}</p>
    {getDescriptionDetails(feature)}
  </div>
)

export default PlaceDescription
