import React from 'react'

const IMAGE_PLACEHOLDER = '/assets/placeimage-placeholder.png'

function getImageUrl(place) {
  let imageUrl = IMAGE_PLACEHOLDER
  if (place.image) {
    imageUrl = place.image.url
  }
  return imageUrl
}

function getProfilePicture(place) {
  if (place.type === 'Farm') {
    return <img className="profile-picture" alt="" src={getImageUrl(place)} />
  }
  return ''
}

const GeneralInformationTab = props => (
  <li className={`tab-content ${props.active}`} id="info">
    {getProfilePicture(props.place)}
    <p>{props.place.description}</p>

    {/* <%= JST["places/details/_" + type.toLowerCase() + "Description"](obj) %> */}
    --- TODO: DESCRIPTION ---

  </li>
)

GeneralInformationTab.propTypes = {
  place: React.PropTypes.shape({
    description: React.PropTypes.string.isRequired,
    image: React.PropTypes.object,
  }).isRequired,
  active: React.PropTypes.string.isRequired,
};


export default GeneralInformationTab
