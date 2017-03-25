import React from 'react'
import SignInTab from './tabs/SignInTab'
import SignUpTab from './tabs/SignUpTab'

const UserOnboarding = ({ signUp, ...props }) => (
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
        {signUp ? <SignUpTab {...props} /> : <SignInTab {...props} />}
      </div>
    </div>
  </div>
)

UserOnboarding.propTypes = {
  signUp: React.PropTypes.bool.isRequired,
}

export default UserOnboarding
