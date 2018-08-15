import React from 'react'
import { featurePropType } from '../../common/geoJsonUtils'

const acceptsNewMembersLabels = {
  yes: 'Wir nehmen neue Mitglieder auf!',
  no: ' Wir nehmen derzeit keine neuen Mitglieder auf!',
  waitlist: 'Wir nehmen neue Mitglieder auf! (Warteliste)'
}

const MembershipInfo = ({
  feature: {
    properties: { acceptsNewMembers }
  }
}) => (
  <p className={`${acceptsNewMembers} membership-availability`}>
    {acceptsNewMembersLabels[acceptsNewMembers]}
  </p>
)

MembershipInfo.propTypes = {
  feature: featurePropType.isRequired
}

export default MembershipInfo
