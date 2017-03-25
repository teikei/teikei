import React from 'react'
import SignInTab from './tabs/SignInTab'
import SignUpTab from './tabs/SignUpTab'

const UserOnboarding = ({ signUp, onSignInSubmit, onSignUpSubmit }) => {
  const SignUp = () => <SignUpTab onSubmit={onSignUpSubmit} />
  const SignIn = () => <SignInTab onSubmit={onSignInSubmit} />

  return (
    <div className="onboarding">
      <div className="container">
        <div className="onboarding-intro">
          <h2>
            Einträge hinzufügen und bearbeiten
          </h2>
          <p>
            Fehlen euer Betrieb, eure Depots, oder eure neu gegründete Initiative auf der Karte? Kein Problem, du kannst sie selbst eintragen.
          </p>
          <p>
            Melde dich mit deiner Email-Adresse und deinem Passwort an, um Einträge auf der Karte vorzunehmen. Du kannst deine Einträge später jederzeit wieder ändern oder löschen.
          </p>
        </div>
        <div className="onboarding-form">
          {signUp ? <SignUp /> : <SignIn />}
        </div>
      </div>
    </div>
  )
}

UserOnboarding.propTypes = {
  signUp: React.PropTypes.bool.isRequired,
  onSignInSubmit: React.PropTypes.func.isRequired,
  onSignUpSubmit: React.PropTypes.func.isRequired,
}

export default UserOnboarding
