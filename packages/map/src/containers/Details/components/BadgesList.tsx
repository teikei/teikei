import Badge from '../../Editors/components/Badge'
import { Feature } from '../../../types/types.ts'

interface BadgesListProps {
  feature: Feature
  category: string
}

const BadgesList = ({ feature, category }: BadgesListProps) => {
  const {
    properties: { type, badges }
  } = feature

  const badgesInCategory = badges.filter((b) => b.category === category)
  return ['Farm', 'Initiative'].includes(type) &&
    badgesInCategory.length > 0 ? (
    <div>
      <h4>
        {category === 'associations' ? 'Mitgliedschaften' : 'Zertifizierungen'}
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
