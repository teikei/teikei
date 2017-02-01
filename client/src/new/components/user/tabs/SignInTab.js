import React from 'react'

const SignInTab = props => (
  <li className={`tab-content ${props.active}`} id="signin-content">
    <p>
      Melde dich mit deiner Email-Adresse und deinem Passwort an,
      um Einträge auf der Karte vorzunehmen oder zu bearbeiten.
    </p>
    <p>
      Neu bei <em>Ernte Teilen?</em> Hier geht es zur
      <a href="#signup" id="signup-link">Registrierung für neue Nutzer</a>
    </p>
    <form id="signin-form" className="form-inputs">
      <input type="submit" className="button" value="Anmelden" />
      <a href="users/password/new" title="Passwort vergessen?">Passwort vergessen?</a>
    </form>
  </li>
)

SignInTab.propTypes = {
  active: React.PropTypes.string.isRequired,
};

export default SignInTab
