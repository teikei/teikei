import React from 'react'

const SignUpTab = props => (
  <li className={`tab-content ${props.active}`} id="signup-content">
    <p>
      Fehlen dein Betrieb oder deine Depots auf dieser Karte?
      <br />Registriere dich, um sie einzutragen!
    </p>
    <p>
      Bereits bei <em>Ernte Teilen</em> registriert?
      <a href="#signin" id="signin-link">Hier gehts zur Anmeldung.</a>
    </p>
    <form id="signup-form" className="form-inputs">
      <p>
        Mit deiner Registrierung akzeptierst du die
        <a href="/terms">Nutzungsbedingungen</a>
        dieser Plattform.
      </p>
      <input type="submit" className="button" value="Registrieren" />
    </form>
  </li>
)

SignUpTab.propTypes = {
  active: React.PropTypes.string.isRequired,
};

export default SignUpTab
