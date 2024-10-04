import React from 'react'
import PropTypes from 'prop-types'

import { Field, reduxForm } from 'redux-form'
import { changePassword } from '../UserOnboarding/duck'
import InputField from '../../components/InputField/index'
import { validator } from '../../common/formUtils'

const UserPasswordForm = ({ handleSubmit, error }) => (
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

UserPasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

UserPasswordForm.defaultProps = {
  error: ''
}

export default reduxForm({
  form: 'useraccount',
  validate: validator('changePassword')
})(UserPasswordForm)
