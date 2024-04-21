import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Field, reduxForm } from 'redux-form'
import { changePassword } from '../UserOnboarding/duck'
import InputField from '../../components/InputField/index'
import { validator } from '../../common/formUtils'

const UserPassword = ({ handleSubmit, error }) => (
  <div className='user-account'>
    <div className='user-container'>
      <h1>Passwort ändern</h1>
      <form onSubmit={handleSubmit}>
        <div className='form-inputs'>
          <strong>{error}</strong>
          <Field
            name='oldPassword'
            label='Aktuelles Passwort'
            component={InputField}
            type='password'
            maxLength='100'
          />
          <Field
            name='password'
            label='Neues Passwort'
            component={InputField}
            type='password'
            maxLength='100'
          />
        </div>
        <div className='form-actions'>
          <input type='submit' className='button submit' value='Speichern' />
        </div>
      </form>
    </div>
  </div>
)

UserPassword.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

UserPassword.defaultProps = {
  error: ''
}

const mapStateToProps = ({ user }) => ({
  initialValues: {},
  email: user.currentUser.email
})

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmit: (values, dispatch, props) =>
      dispatch(changePassword(values, props.email))
  }
}

const UserPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({ form: 'useraccount', validate: validator('changePassword') })(
    UserPassword
  )
)

export default UserPasswordContainer
