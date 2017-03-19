import React from 'react'

const MembershipTab = props => (
  <li className={`tab-content ${props.active}`} id="membership">
    <h4>Mitgliederbeteiligung</h4>
    <p>{props.place.participation}</p>
    <h4>Maximale Mitgliederzahl:</h4>
    {props.place.maximum_members}
  </li>
)

MembershipTab.propTypes = {
  place: React.PropTypes.shape({
    participation: React.PropTypes.string,
    maximum_members: React.PropTypes.number,
  }).isRequired,
  active: React.PropTypes.string.isRequired,
};

export default MembershipTab
