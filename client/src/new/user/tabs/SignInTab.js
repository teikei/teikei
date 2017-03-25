import React from 'react'
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router'
import { SIGN_UP } from '../../AppRouter'
import i18n from '../../i18n'

const SignInTab = ({ onSignInSubmit }) => (
  <form onSubmit={onSignInSubmit}>
    <h2>
      Anmeldung für registrierte
      Nutzerinnen&nbsp;und&nbsp;Nutzer
    </h2>

    <p>
      Neu hier?
      <Link to={SIGN_UP}>
        {i18n.t('nav.sign_up')}
      </Link>
    </p>

    <div className="form-inputs-big">
      <label htmlFor="email">E-Mail-Adresse</label>
      <Field name="email" component="input" type="text" maxLength="100" />
      <label htmlFor="password" maxLength="100">Passwort</label>
      <Field name="password" component="input" type="password" />
    </div>

    <div className="form-actions-big">
      <input type="submit" className="button" value="Anmelden" />
      <a href="users/password/new" title="Passwort vergessen?">Passwort vergessen?</a>
    </div>

  </form>
)

SignInTab.propTypes = {
  onSignInSubmit: React.PropTypes.func.isRequired,
}

export default reduxForm({ form: 'signin' })(SignInTab)

