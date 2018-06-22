import React from 'react'
import PropTypes from 'prop-types'
import i18n from '../../i18n'

const GoalItem = goal => <li>{goal}</li>

const InitiativeDescription = ({ place }) => {
  const goals = place.goals.map(name => i18n.t(`forms.labels.goals.${name}`))
  return <ul>{goals.map(goal => GoalItem(goal))}</ul>
}

InitiativeDescription.propTypes = {
  place: PropTypes.shape({
    goal_keys: PropTypes.arrayOf(PropTypes.number)
  }).isRequired
}

export default InitiativeDescription
