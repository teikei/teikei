import React from 'react'
import FarmForm from './components/FarmForm'

const FarmEditor = ({ initialValues, handleSubmit, user, title }) => (
  <div className="entries-editor">
    <div className="container">

      <h1>{title}</h1>

      <FarmForm
        onSubmit={handleSubmit}
        initialValues={initialValues}
        user={user}
      />

    </div>
  </div>
)

FarmEditor.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  initialValues: React.PropTypes.shape(),
  user: React.PropTypes.shape().isRequired,
  title: React.PropTypes.string.isRequired,
}

FarmEditor.defaultProps = {
  initialValues: {},
}

export default FarmEditor
