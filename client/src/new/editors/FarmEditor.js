import React, { PropTypes } from 'react'
import FarmForm from './components/FarmForm'

const FarmEditor = ({ initialValues, onPlaceSubmit, user, title }) => (
  <div className="entries-editor">
    <div className="entries-editor-container">

      <h1>{title}</h1>

      <FarmForm
        onSubmit={onPlaceSubmit}
        initialValues={initialValues}
        user={user}
      />

    </div>
  </div>
)

FarmEditor.propTypes = {
  onPlaceSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape(),
  user: PropTypes.shape().isRequired,
  title: PropTypes.string.isRequired,
}

FarmEditor.defaultProps = {
  initialValues: {},
}

export default FarmEditor
