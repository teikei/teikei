import PropTypes from 'prop-types'

import i18n from '../../../i18n'
import BadgesList from './BadgesList'

const GoalItem = (goal) => <li key={goal}>{goal}</li>

const InitiativeDescription = ({ feature }) => {
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

InitiativeDescription.propTypes = {
  feature: PropTypes.shape({
    goals: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
}

export default InitiativeDescription
