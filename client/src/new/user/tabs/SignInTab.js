import React from 'react'
import { Field, reduxForm } from 'redux-form';

const SignInForm = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit} className="form-inputs">
    <fieldset>
      <label htmlFor="email">E-Mail-Adresse</label>
      <div>
        <Field name="email" component="input" type="text" maxLength="100" />
      </div>
      <label htmlFor="password" maxLength="100">Passwort</label>
      <div>
        <Field name="password" component="input" type="password" />
      </div>
    </fieldset>
    <input type="submit" className="button" value="Anmelden" />
    <a href="users/password/new" title="Passwort vergessen?">Passwort vergessen?</a>
  </form>
)

SignInForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
};


const ReduxSignInForm = reduxForm({ form: 'signin' })(SignInForm)

const SignInTab = ({ onSignInSubmit, active }) => (
  <li className={`tab-content ${active}`} id="signin-content">
    <p>
      Melde dich mit deiner Email-Adresse und deinem Passwort an,
      um Einträge auf der Karte vorzunehmen oder zu bearbeiten.
    </p>
    <p>
      Neu bei <em>Ernte Teilen?</em> Hier geht es zur
      <a href="#signup" id="signup-link">Registrierung für neue Nutzer</a>
    </p>
    <div id="signin-form" className="form-inputs">
      <ReduxSignInForm onSubmit={onSignInSubmit} />
    </div>
  </li>
)

SignInTab.propTypes = {
  active: React.PropTypes.string.isRequired,
  onSignInSubmit: React.PropTypes.func.isRequired,
};

export default SignInTab
