import { AcceptsNewMembers, Feature } from '../../../types/types'

const acceptsNewMembersLabels: Record<AcceptsNewMembers, string> = {
  yes: 'Wir nehmen neue Mitglieder auf!',
  no: ' Wir nehmen derzeit keine neuen Mitglieder auf!',
  waitlist: 'Wir nehmen neue Mitglieder auf! (Warteliste)'
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
