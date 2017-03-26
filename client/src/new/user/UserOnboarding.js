import React from 'react'
import SignInForm from './tabs/SignInForm'
import SignUpForm from './tabs/SignUpForm'
import i18n from '../i18n'

const UserOnboarding = ({ signUp, onSignInSubmit, onSignUpSubmit }) => {
  const SignUp = () => <SignUpTab onSubmit={onSignUpSubmit} />
  const SignIn = () => <SignInTab onSubmit={onSignInSubmit} />

  return (
    <div className="onboarding">
      <div className="container">

        <div className="onboarding-intro">
          <h2>{i18n.t('user.onboarding.title')}</h2>
          <p>{i18n.t('user.onboarding.intro')}</p>
          <p>{i18n.t('user.onboarding.explanation')}</p>
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
