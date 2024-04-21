import React from 'react'
import FarmDescription from './FarmDescription'
import DepotDescription from './DepotDescription'
import InitiativeDescription from './InitiativeDescription'
import { featurePropType } from '../../../common/geoJsonUtils'

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

const getDescriptionDetails = (feature) => {
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

const PlaceDescription = ({ feature }) => (
  <div>
    {/* getProfilePicture(place) */}
    <p>{feature.properties.description}</p>
    {getDescriptionDetails(feature)}
  </div>
)

PlaceDescription.propTypes = {
  feature: featurePropType
}

export default PlaceDescription
