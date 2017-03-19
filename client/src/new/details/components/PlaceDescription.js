import React from 'react'
import FarmDescription from './FarmDescription'
import DepotDescription from './DepotDescription'

const IMAGE_PLACEHOLDER = '/assets/placeimage-placeholder.png'

const getImageUrl = (place) => {
  let imageUrl = IMAGE_PLACEHOLDER
  if (place.image) {
    imageUrl = place.image.url
  }
  return imageUrl
}

const getProfilePicture = (place) => {
  switch (place.type) {
    case 'Farm':
      return <img className="profile-picture" alt="" src={getImageUrl(place)} />
    default:
      return ''
  }
}

const getDescriptionDetails = (place) => {
  switch (place.type) {
    case 'Farm':
      return <FarmDescription place={place} />
    case 'Depot':
      return <DepotDescription place={place} />
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
  place: React.PropTypes.shape({
    description: React.PropTypes.string,
  }).isRequired,
};

export default PlaceDescription
