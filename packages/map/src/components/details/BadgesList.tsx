import { useTranslation } from 'react-i18next'
import { Feature } from '@/types/types'
import Badge from '@/components/places/Badge'

interface BadgesListProps {
  feature: Feature
  category: string
}

const BadgesList = ({ feature, category }: BadgesListProps) => {
  const { t } = useTranslation()
  const {
    properties: { type, badges }
  } = feature

  const badgesInCategory = badges.filter((b) => b.category === category)
  return ['Farm', 'Initiative'].includes(type) &&
    badgesInCategory.length > 0 ? (
    <div>
      <h4>
        {category === 'associations'
          ? t('places.details.badges')
          : t('places.details.certifications')}
      </h4>
      <div className='farm-form-badges-wrapper'>
        {badgesInCategory.map((badge) => (
          <Badge key={badge.id} logoUrl={badge.logo} url={badge.url} />
        ))}
      </div>
    </div>
  ) : null
}

export default BadgesList
