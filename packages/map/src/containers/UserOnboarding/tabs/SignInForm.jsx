import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import { useTranslation } from 'react-i18next'
import i18n from '../../../i18n/i18n'
import { SIGN_UP, RECOVER_PASSWORD } from '../../../AppRouter'
import InputField from '../../../components/InputField/index'

const SignInForm = ({ handleSubmit, error }) => {
  const { t } = useTranslation()
  return (
    <form onSubmit={handleSubmit}>
      <h2>{t('user.form.sign_in_title')}</h2>
      <p>
        {t('user.form.new')}
        <Link to={SIGN_UP}>{t('user.form.sign_up_link')}</Link>
      </p>

      <div className='form-inputs-big'>
        <strong>{error}</strong>
        <Field
          name='email'
          label={t('user.form.email')}
          component={InputField}
          type='email'
          maxLength='100'
        />

        <Field
          name='password'
          label={t('user.form.password')}
          component={InputField}
          type='password'
          maxLength='100'
        />
      </div>

      <div className='form-actions-big'>
        <input type='submit' className='button' value={t('user.form.submit')} />

        <Link to={RECOVER_PASSWORD}>{t('user.form.forgot_password')}</Link>
      </div>
    </form>
  )
}

SignInForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

SignInForm.defaultProps = {
  error: ''
}

const validate = (values) => {
  const errors = {}
  if (!values.email) {
    errors.email = i18n.t('forms.validation.required')
  }
  if (!values.password) {
    errors.password = i18n.t('forms.validation.required')
  }
  return errors
}

export default reduxForm({ form: 'signin', validate })(SignInForm)
