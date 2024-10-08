import i18n from '../../../i18n'
import BadgesList from './BadgesList'
import { Feature } from '../../../types/types.ts'

interface InitiativeDescriptionProps {
  feature: Feature
}

const GoalItem = (goal: string) => <li key={goal}>{goal}</li>

const InitiativeDescription = ({ feature }: InitiativeDescriptionProps) => {
  const {
    properties: { goals }
  } = feature

  return (
    <div>
      <ul>
        {goals
          .map(({ name }) => i18n.t(`forms.labels.goals.${name}`))
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
