import React, { PropTypes } from 'react'
import DepotForm from './components/DepotForm'

const DepotEditor = ({ initialValues, onDepotSubmit, farms, user, title }) => (
  <div className="entries-editor">
    <div className="container">

      <h1>{title}</h1>

      <DepotForm
        onSubmit={onDepotSubmit}
        farms={farms}
        initialValues={initialValues}
        user={user}
      />

    </div>
  </div>
)

DepotEditor.propTypes = {
  onDepotSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape(),
  user: PropTypes.shape().isRequired,
  farms: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
}

DepotEditor.defaultProps = {
  initialValues: {},
}

export default DepotEditor
