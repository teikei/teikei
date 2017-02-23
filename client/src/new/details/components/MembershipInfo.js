import React from 'react'

const acceptsNewMembers = {
  yes: 'Wir nehmen neue Mitglieder auf!',
  no: ' Wir nehmen derzeit keine neuen Mitglieder auf!',
  waitlist: 'Wir nehmen neue Mitglieder auf! (Warteliste)',
}

const MembershipInfo = (props = { acceptsNewMembers: '' }) => (
  <span className={`${props.place.accepts_new_members} membership-availability`}>
    {acceptsNewMembers[props.place.accepts_new_members]}
  </span>
)

MembershipInfo.propTypes = {
  place: React.PropTypes.shape({
    accepts_new_members: React.PropTypes.string,
  }).isRequired,
};


export default MembershipInfo
