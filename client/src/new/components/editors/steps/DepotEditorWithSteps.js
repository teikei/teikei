import React from 'react'
import DepotBasics from './DepotBasics'
import DepotContact from './DepotContact'

const DepotEditor = ({ step }) => {
  let currentStep = ''
  switch (step) {
    case 0:
    case 1:
      currentStep = DepotContact
    default:
      currentStep = DepotBasics
  }

  return (
    <div>
      <section className="wizard">
        <h2 className="headline">Neues Depot eintragen</h2>
        {currentStep}
      </section>
      <div className="legend">
        <p>Bei den mit einem Stern * gekennzeichneten
          Formularfelder handelt es sich um Pflichtangaben.
        </p>
      </div>
    </div>
  )
}

DepotEditor.propTypes = {
  step: React.PropTypes.number,
}

export default DepotEditor
