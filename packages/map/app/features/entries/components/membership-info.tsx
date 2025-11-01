import { useTranslation } from 'react-i18next'
import type { Feature } from '~/types/types'
import { acceptsNewMembersKeys } from '~/utils/i18n-utils'

interface MembershipInfoProps {
  feature: Feature
}

const MembershipInfo = ({
  feature: {
    properties: { acceptsNewMembers }
  }
}: MembershipInfoProps) => {
  const { t } = useTranslation()
  return (
    <p className={`${acceptsNewMembers} membership-availability`}>
      {acceptsNewMembers && t(acceptsNewMembersKeys[acceptsNewMembers])}
    </p>
  )
}

export default MembershipInfo
