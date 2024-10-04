import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'

import i18n from '../../i18n'
import InputField from '../../components/InputField/index'
import { validator } from '../../common/formUtils'

const UserRecoverPasswordForm = ({ handleSubmit, error }) => (
  <div className='user-account'>
    <div className='user-container'>
      <h1>{i18n.t('user.form.forgot_password')}</h1>
      <form onSubmit={handleSubmit}>
        <div className='form-inputs'>
          <strong>{error}</strong>
          <Field
            name='email'
            label={i18n.t('user.form.email')}
            component={InputField}
            type='email'
            maxLength='100'
          />
          <p className='form-explanation'>
            {i18n.t('user.form.password_explanation')}
          </p>
        </div>
        <div className='form-actions'>
          <input
            type='submit'
            className='button submit'
            value={i18n.t('user.form.reset_password')}
          />
        </div>
      </form>
    </div>
  </div>
)

UserRecoverPasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

UserRecoverPasswordForm.defaultProps = {
  error: ''
}

export default reduxForm({
  form: 'recoverPassword',
  validate: validator('recoverPassword')
})(UserRecoverPasswordForm)
