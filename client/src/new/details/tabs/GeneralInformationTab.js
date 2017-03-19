import React from 'react'
import PlaceDescription from '../components/PlaceDescription'

const GeneralInformationTab = ({ place, active }) => (
  <li className={`tab-content ${active}`} id="info">
    <PlaceDescription place={place} />
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
