import React from 'react'
import FarmForm from './FarmForm'

const FarmEditor = ({ handleSubmit }) => (
  <div className="entry-view open" style={{ top: '0px', opacity: 1, visibility: 'visible', display: 'block' }}>
    <div className="container">
      <section className="wizard">
        <div className="forms">
          <h2 className="headline">Neuen Betrieb eintragen</h2>
          <FarmForm handleSubmit={handleSubmit} />
        </div>
        <div className="legend">
          <p>Bei den mit einem Stern * gekennzeichneten
            Formularfelder handelt es sich um Pflichtangaben.
          </p>
        </div>
      </section>
    </div>
  </div>
)

FarmEditor.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
}

export default FarmEditor
