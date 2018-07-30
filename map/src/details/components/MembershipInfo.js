import React from 'react'
import PropTypes from 'prop-types'

const acceptsNewMembers = {
  yes: 'Wir nehmen neue Mitglieder auf!',
  no: ' Wir nehmen derzeit keine neuen Mitglieder auf!',
  waitlist: 'Wir nehmen neue Mitglieder auf! (Warteliste)'
}

const MembershipInfo = (props = { acceptsNewMembers: '' }) => (
  <p className={`${props.place.acceptsNewMembers} membership-availability`}>
    {acceptsNewMembers[props.place.acceptsNewMembers]}
  </p>
)

MembershipInfo.propTypes = {
  place: PropTypes.shape({
    acceptsNewMembers: PropTypes.string
  }).isRequired
}

export default MembershipInfo
