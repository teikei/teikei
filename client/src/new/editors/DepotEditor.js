import React from 'react'
import DepotForm from './components/DepotForm'

const DepotEditor = ({ initialValues, handleSubmit, farms, user, title }) => (
  <div className="entries-editor">
    <div className="container">

      <h1>{title}</h1>

      <DepotForm
        onSubmit={handleSubmit}
        farms={farms}
        initialValues={initialValues}
        user={user}
      />

    </div>
  </div>
)

DepotEditor.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  initialValues: React.PropTypes.shape(),
  user: React.PropTypes.shape().isRequired,
  farms: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  title: React.PropTypes.string.isRequired,
}

DepotEditor.defaultProps = {
  initialValues: {},
}

export default DepotEditor
