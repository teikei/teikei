import React from 'react'
import SignUpForm from './tabs/SignUpForm'
import SignInForm from './tabs/SignInForm'
import i18n from '../i18n'

const UserOnboarding = ({ signUp, onSignInSubmit, onSignUpSubmit }) => {
  const SignUp = () => <SignUpForm onSubmit={onSignUpSubmit} />
  const SignIn = () => <SignInForm onSubmit={onSignInSubmit} />

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
