import React from 'react'
import DepotForm from './DepotForm'

const DepotEditor = ({ initialValues, handleSubmit, farms, user }) => (
  <div className="entries-editor">
    <div className="container">

      <h1>Neues Depot eintragen</h1>

      <DepotForm
        onSubmit={handleSubmit}
        farms={farms}
        initialValues={initialValues}
        user={user}
      />

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
  user: React.PropTypes.shape().isRequired,
  farms: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
}

DepotEditor.defaultProps = {
  initialValues: {},
}

export default DepotEditor
