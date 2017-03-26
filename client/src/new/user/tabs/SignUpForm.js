import React from 'react'
import { Link } from 'react-router'
import { Field, reduxForm } from 'redux-form';
import { SIGN_IN } from '../../AppRouter'
import i18n from '../../i18n'
import InputField from '../../common/InputField'

const SignUpForm = ({ handleSubmit, error }) => (
  <form onSubmit={handleSubmit}>
    <h2>{i18n.t('user.form.sign_up_title')}</h2>

    <p>
      {i18n.t('user.form.existing')}
      <Link to={SIGN_IN}>{i18n.t('user.form.sign_in_link')}</Link>
    </p>

    <div className="form-inputs-big">
      <strong>{ error }</strong>
      <Field
        name="name"
        label={i18n.t('user.form.name')}
        component={InputField}
        type="text"
        maxLength="100"
      />

      <Field
        name="phone"
        label={i18n.t('user.form.phone')}
        component={InputField}
        type="text"
        maxLength="100"
      />

      <Field
        name="email"
        label={i18n.t('user.form.email')}
        component={InputField}
        type="email"
        maxLength="100"
      />

      <Field
        name="password"
        label={i18n.t('user.form.password')}
        component={InputField}
        type="password"
        maxLength="100"
      />

      <Field
        name="password_confirmation"
        label={i18n.t('user.form.password_confirmation')}
        component={InputField}
        type="password"
        maxLength="100"
      />
    </div>

    <p>
      {i18n.t('user.form.confirmation')}
      <a href="https://ernte-teilen.org/terms">{i18n.t('user.form.terms')}</a>
    </p>

    <div className="form-actions-big">
      <input
        type="submit"
        className="button"
        value={i18n.t('user.form.submit')}
      />
    </div>
  </form>
)

SignUpForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  error: React.PropTypes.string,
}

SignUpForm.defaultProps = {
  error: '',
}

const validate = (values) => {
  const errors = {}
  if (!values.name) {
    errors.name = i18n.t('forms.validation.required')
  }
  if (!values.email) {
    errors.email = i18n.t('forms.validation.required')
  }
  if (!values.password) {
    errors.password = i18n.t('forms.validation.required')
  }
  if (!values.password_confirmation) {
    errors.password_confirmation = i18n.t('forms.validation.required')
  }
  return errors
}

export default reduxForm({ form: 'signup', validate })(SignUpForm)
