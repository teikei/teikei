import React, { PropTypes } from 'react'
import FarmDescription from './FarmDescription'
import DepotDescription from './DepotDescription'
import InitiativeDescription from './InitiativeDescription'

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

const getDescriptionDetails = place => {
  switch (place.type) {
    case 'Farm':
      return <FarmDescription place={place} />
    case 'Depot':
      return <DepotDescription place={place} />
    case 'Initiative':
      return <InitiativeDescription place={place} />
    default:
      return <div />
  }
}

const PlaceDescription = ({ place }) => (
  <div>
    {/* getProfilePicture(place) */}
    <p>{place.description}</p>
    {getDescriptionDetails(place)}
  </div>
)

PlaceDescription.propTypes = {
  place: PropTypes.shape({
    description: PropTypes.string
  }).isRequired
}

export default PlaceDescription
