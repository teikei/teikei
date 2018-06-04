import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import InputField from '../common/InputField'
import i18n from '../i18n'

const RecoverPassword = ({ handleSubmit, error }) => (
  <div className="user-account">
    <div className="user-container">
      <h1>{i18n.t('user.form.forgot_password')}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-inputs">
          <strong>{error}</strong>
          <Field
            name="email"
            label={i18n.t('user.form.email')}
            component={InputField}
            type="email"
            maxLength="100"
          />
          <p className="form-explanation">
            {i18n.t('user.form.password_explanation')}
          </p>
        </div>
        <div className="form-actions">
          <input
            type="submit"
            className="button submit"
            value={i18n.t('user.form.reset_password')}
          />
        </div>
      </form>
    </div>
  </div>
)

RecoverPassword.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

RecoverPassword.defaultProps = {
  error: ''
}

const validate = values => {
  const errors = {}
  if (!values.email) {
    errors.email = i18n.t('forms.validation.required')
  }
  return errors
}

export default reduxForm({ form: 'recoverpassword', validate })(RecoverPassword)
