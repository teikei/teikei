import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { signIn, signUp } from './duck'
import { config } from '../../index'
import SignUpForm from './tabs/SignUpForm'
import SignInForm from './tabs/SignInForm'
import i18n from '../../i18n'

const UserOnboarding = ({ signUp, onSignInSubmit, onSignUpSubmit }) => {
  const SignUp = () => <SignUpForm onSubmit={onSignUpSubmit} />
  const SignIn = () => <SignInForm onSubmit={onSignInSubmit} />

  return (
    <div className="user-onboarding">
      <div className="user-container">
        <div className="user-onboarding-intro">
          <h2>{i18n.t('user.onboarding.title')}</h2>
          <p>{i18n.t('user.onboarding.intro')}</p>
          <p>{i18n.t('user.onboarding.explanation')}</p>
        </div>
        <div className="user-onboarding-form">
          {signUp ? <SignUp /> : <SignIn />}
        </div>
      </div>
    </div>
  )
}

UserOnboarding.propTypes = {
  signUp: PropTypes.bool.isRequired,
  onSignInSubmit: PropTypes.func.isRequired,
  onSignUpSubmit: PropTypes.func.isRequired,
}

const mapStateToProps = ({ user }, { route }) => ({
  loggedIn: user.loggedIn,
  signUp: route.signUp,
})

const mapDispatchToProps = (dispatch) => ({
  onSignInSubmit: (payload) => dispatch(signIn(payload)),
  onSignUpSubmit: (payload) =>
    dispatch(signUp({ ...payload, baseurl: config.baseUrl })),
})

const UserOnboardingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserOnboarding)

export default UserOnboardingContainer
