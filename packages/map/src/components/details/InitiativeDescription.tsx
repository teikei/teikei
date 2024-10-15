import BadgesList from './BadgesList'
import { Feature } from '../../types/types'
import { useTranslation } from 'react-i18next'

interface InitiativeDescriptionProps {
  feature: Feature
}

const GoalItem = (goal: string) => <li key={goal}>{goal}</li>

const InitiativeDescription = ({ feature }: InitiativeDescriptionProps) => {
  const { t } = useTranslation()
  const {
    properties: { goals }
  } = feature

  return (
    <div>
      <ul>
        {goals
          .map(({ name }) => t(`forms.labels.goals.${name}`))
          .map((goal) => GoalItem(goal))}
      </ul>
      <div>
        <BadgesList category='associations' feature={feature} />
      </div>
      <div>
        <BadgesList category='certifications' feature={feature} />
      </div>
    </div>
  )
}

export default InitiativeDescription
