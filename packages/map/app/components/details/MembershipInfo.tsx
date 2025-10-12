import { useTranslation } from 'react-i18next'
import { acceptsNewMembersKeys } from '~/common/i18nUtils'
import type { Feature } from '~/types/types'

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
