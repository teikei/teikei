import React, { Component } from 'react'
import { LocalForm, Control } from 'react-redux-form';
import request from 'superagent'
import browserHistory from '../../../browserHistory'

class SignInTab extends Component {
  constructor(props) {
    super(props);
    this.state = { values: { username: '', password: '' } };
  }

  handleSubmit(values) {
    request
      .post('/users/sign_in', values)
      .end((err, res) => {
        if (res.error) {
          console.log('LOGIN FAILED');
          res.body.errors.forEach(e => console.log(e));
        } else {
          console.log('LOGIN OK');
          Teikei.currentUser = res.body
          browserHistory.push('/new');
        }
      })
  }

  render() {
    return (
      <li className={`tab-content ${this.props.active}`} id="signin-content">
        <p>
          Melde dich mit deiner Email-Adresse und deinem Passwort an,
          um Einträge auf der Karte vorzunehmen oder zu bearbeiten.
        </p>
        <p>
          Neu bei <em>Ernte Teilen?</em> Hier geht es zur
          <a href="#signup" id="signup-link">Registrierung für neue Nutzer</a>
        </p>
        <div id="signin-form" className="form-inputs">
          <LocalForm
            onSubmit={values => this.handleSubmit(values)}
          >
            <fieldset>
              <label htmlFor="signInEmail">E-Mail-Adresse</label>
              <Control.text model=".user.email" maxLength="100" />
              <label htmlFor="signInPassword" maxLength="100">Passwort</label>
              <Control.text model=".user.password" type="password" />
            </fieldset>
            <input type="submit" className="button" value="Anmelden" />
            <a href="users/password/new" title="Passwort vergessen?">Passwort vergessen?</a>
          </LocalForm>
        </div>
      </li>
    )
  }

}

SignInTab.propTypes = {
  active: React.PropTypes.string.isRequired,
};

export default SignInTab
