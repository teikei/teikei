import React from 'react'
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router'
import { SIGN_IN } from '../../AppRouter'
import i18n from '../../i18n'

const SignUpTab = ({ onSignUpSubmit }) => (
  <form onSubmit={onSignUpSubmit}>
    <h2>
      Registrierung für neue
      Nutzerinnen&nbsp;und&nbsp;Nutzer
    </h2>

    <p>
      Bereits registriert?
      <Link to={SIGN_IN}>
        {i18n.t('nav.sign_up')}
      </Link>
    </p>

    <p>
      Mit deiner Registrierung akzeptierst du
      die <a href="/terms">Nutzungsbedingungen</a> dieser Plattform.
    </p>

    <input type="submit" onSubmit={values => onSignUpSubmit(values)} className="button" value="Registrieren" />
  </form>
)

SignUpTab.propTypes = {
  onSignUpSubmit: React.PropTypes.func.isRequired,
}

export default reduxForm({ form: 'signin' })(SignUpTab)
