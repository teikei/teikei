import i18n from 'i18next'

import { AcceptsNewMembers, Feature } from '../../types/types'

const acceptsNewMembersLabels: Record<AcceptsNewMembers, string> = {
  yes: i18n.t('places.details.accepts_new_members_yes'),
  no: i18n.t('places.details.accepts_new_members_no'),
  waitlist: i18n.t('places.details.accepts_new_members_waitlist')
}

interface MembershipInfoProps {
  feature: Feature
}

const MembershipInfo = ({
  feature: {
    properties: { acceptsNewMembers }
  }
}: MembershipInfoProps) => (
  <p className={`${acceptsNewMembers} membership-availability`}>
    {acceptsNewMembers && acceptsNewMembersLabels[acceptsNewMembers]}
  </p>
)

export default MembershipInfo
