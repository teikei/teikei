import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { Field, reduxForm } from 'redux-form'
import { SIGN_IN, MAP } from '../../AppRouter'
import i18n from '../../i18n'
import InputField from '../../common/InputField'

const SignUpForm = ({ handleSubmit, submitSucceeded, error }) => {
  if (submitSucceeded) {
    return (
      <form className="form-inputs" onSubmit={handleSubmit}>
        <strong>
          <p>Du wurdest erfolgreich registriert!</p>
          <p>
            Wir haben Dir eine Bestätigungsemail geschickt, mit der du Deine
            Registrierung abschließen kannst.
          </p>
        </strong>
        <Link to={MAP}>zurück zur Karte</Link>
      </form>
    )
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>{i18n.t('user.form.sign_up_title')}</h2>

      <p>
        {i18n.t('user.form.existing')}
        <Link to={SIGN_IN}>{i18n.t('user.form.sign_in_link')}</Link>
      </p>

      <div className="form-inputs-big">
        <strong>{error}</strong>
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
        <a
          href="https://ernte-teilen.org/terms"
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.t('user.form.terms')}
        </a>
        /
        <a
          href="https://ernte-teilen.org/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.t('user.nav.privacy')}
        </a>
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
}

SignUpForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  error: PropTypes.string
}

SignUpForm.defaultProps = {
  error: ''
}

export default reduxForm({
  form: 'signup'
})(SignUpForm)
