import React from 'react'
import PropTypes from 'prop-types'
import BadgesList from './BadgesList'
import { useTranslation } from 'react-i18next'

const GoalItem = (goal) => <li key={goal}>{goal}</li>

const InitiativeDescription = ({ feature }) => {
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

InitiativeDescription.propTypes = {
  feature: PropTypes.shape({
    goals: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
}

export default InitiativeDescription
