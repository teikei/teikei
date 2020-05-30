import React from 'react'
import PropTypes from 'prop-types'
import i18n from '../../../i18n'

const GoalItem = (goal) => <li key={goal}>{goal}</li>

const InitiativeDescription = ({ feature }) => {
  const {
    properties: { goals },
  } = feature
  return (
    <ul>
      {goals
        .map(({ name }) => i18n.t(`forms.labels.goals.${name}`))
        .map((goal) => GoalItem(goal))}
    </ul>
  )
}

InitiativeDescription.propTypes = {
  feature: PropTypes.shape({
    goals: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
}

export default InitiativeDescription
