import React from 'react'
import DepotForm from './DepotForm'

const DepotEditor = ({ initialValues, handleSubmit, farms }) => (
  <div className="entries-editor">
    <div className="container">
      <h1>Neues Depot eintragen</h1>
      <DepotForm onSubmit={handleSubmit} farms={farms} initialValues={initialValues} />
      <div className="legend">
        <p>Bei den mit einem Stern * gekennzeichneten
          Formularfelder handelt es sich um Pflichtangaben.
        </p>
      </div>
    </div>
  </div>
)

DepotEditor.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  initialValues: React.PropTypes.shape(),
  farms: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
}

DepotEditor.defaultProps = {
  initialValues: {},
}

export default DepotEditor
