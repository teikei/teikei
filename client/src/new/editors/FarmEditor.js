import React, { PropTypes } from 'react'
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
  onFarmSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape(),
  user: PropTypes.shape().isRequired,
  title: PropTypes.string.isRequired,
}

FarmEditor.defaultProps = {
  initialValues: {},
}

export default FarmEditor
