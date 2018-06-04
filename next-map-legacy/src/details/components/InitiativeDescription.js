import React from 'react'
import PropTypes from 'prop-types'
import i18n from '../../i18n'

const GOAL_OPTIONS = [
  'forms.labels.goals.land',
  'forms.labels.goals.staff',
  'forms.labels.goals.organizers',
  'forms.labels.goals.consumers'
]

const GoalItem = goal => <li>{goal}</li>

const InitiativeDescription = ({ place }) => {
  const goals = place.goal_keys.map(id => i18n.t(GOAL_OPTIONS[id]))
  return <ul>{goals.map(goal => GoalItem(goal))}</ul>
}

InitiativeDescription.propTypes = {
  place: PropTypes.shape({
    goal_keys: PropTypes.arrayOf(PropTypes.number)
  }).isRequired
}

export default InitiativeDescription
