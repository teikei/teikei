import React from 'react'
import PropTypes from 'prop-types'
import DepotForm from './components/DepotForm'
import FarmForm from './components/FarmForm'
import InitiativeForm from './components/InitiativeForm'

const Form = ({ type, initialValues, onPlaceSubmit, farms, user, products }) => {
  if (type === 'depot') {
    return (
      <DepotForm
        onSubmit={onPlaceSubmit}
        farms={farms}
        initialValues={initialValues}
        user={user}
      />
    )
  }
  if (type === 'farm') {
    return (
      <FarmForm
        onSubmit={onPlaceSubmit}
        initialValues={initialValues}
        user={user}
        products={products}
      />
    )
  }
  if (type === 'initiative') {
    return (
      <InitiativeForm
        onSubmit={onPlaceSubmit}
        initialValues={initialValues}
        user={user}
      />
    )
  }
  return ''
}

const editor = type => {
  const Editor = ({ initialValues, onPlaceSubmit, farms, user, title, products }) => (
    <div className="entries-editor">
      <div className="entries-editor-container">
        <h1>{title}</h1>

        <Form
          type={type}
          onPlaceSubmit={onPlaceSubmit}
          farms={farms}
          initialValues={initialValues}
          user={user}
          products={products}
        />
      </div>
    </div>
  )

  Editor.propTypes = {
    onPlaceSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.shape(),
    user: PropTypes.shape().isRequired,
    farms: PropTypes.arrayOf(PropTypes.object).isRequired,
    title: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired
  }

  Editor.defaultProps = {
    initialValues: {}
  }

  return Editor
}

Form.propTypes = {
  type: PropTypes.oneOf(['depot', 'farm', 'initiative']).isRequired,
  onPlaceSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape(),
  user: PropTypes.shape().isRequired,
  farms: PropTypes.arrayOf(PropTypes.object).isRequired,
  products: PropTypes.array.isRequired
}

Form.defaultProps = {
  initialValues: {}
}

export default editor
