import React from 'react'
import FarmForm from './components/FarmForm'

const FarmEditor = ({ initialValues, onFarmSubmit, user, title }) => (
  <div className="entries-editor">
    <div className="container">

      <h1>{title}</h1>

      <FarmForm
        onSubmit={onFarmSubmit}
        initialValues={initialValues}
        user={user}
      />

    </div>
  </div>
)

FarmEditor.propTypes = {
  onFarmSubmit: React.PropTypes.func.isRequired,
  initialValues: React.PropTypes.shape(),
  user: React.PropTypes.shape().isRequired,
  title: React.PropTypes.string.isRequired,
}

FarmEditor.defaultProps = {
  initialValues: {},
}

export default FarmEditor
