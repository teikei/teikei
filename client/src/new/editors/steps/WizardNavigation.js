import React from 'react'

const visibleStyle = (visible) => {
  if (visible) {
    return { display: 'inline-block' }
  }
  return { display: 'none' }
}

const WizardNavigation = ({ currentStep, numberOfSteps }) => {
  const saveVisible = currentStep === numberOfSteps - 1
  const nextVisible = currentStep < numberOfSteps - 1
  const previousVisible = currentStep > 0

  return (
    <ul id="wizard-navigation" className="button-group">
      <li>
        <button className="button submit" style={visibleStyle(saveVisible)}>Speichern</button>
      </li>
      <li>
        <button className="button next" style={visibleStyle(nextVisible)}>Weiter</button>
      </li>
      <li>
        <button className="button prev" style={visibleStyle(previousVisible)}>Zurück</button>
      </li>
    </ul>
  )
}

WizardNavigation.propTypes = {
  currentStep: React.PropTypes.number.isRequired,
  numberOfSteps: React.PropTypes.number.isRequired,
}

export default WizardNavigation
