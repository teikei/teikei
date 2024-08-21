import React, { useEffect, useTransition } from 'react'
import PropTypes from 'prop-types'
import { connect, useSelector } from 'react-redux'

import { signIn, signUp } from './duck'
import { config } from '../../main'
import SignUpForm from './tabs/SignUpForm'
import SignInForm from './tabs/SignInForm'
import { history, MAP } from '../../AppRouter'
import { useTranslation } from 'react-i18next'

const UserOnboarding = ({ signUp = false, onSignInSubmit, onSignUpSubmit }) => {
  const { t } = useTranslation()
  const SignUp = () => <SignUpForm onSubmit={onSignUpSubmit} />
  const SignIn = () => <SignInForm onSubmit={onSignInSubmit} />

  const loggedIn = useSelector((state) => state.user.loggedIn)

  const fromLocation =
    history.location.state &&
    history.location.state.from &&
    history.location.state.from.pathname

  useEffect(() => {
    if (loggedIn) {
      history.push(fromLocation || MAP)
    }
  }, [loggedIn])

  return (
    <div className='user-onboarding'>
      <div className='user-container'>
        <div className='user-onboarding-intro'>
          <h2>{t('user.onboarding.title')}</h2>
          {fromLocation ? (
            <p>{t('user.onboarding.protected_view_info')}</p>
          ) : (
            <p>{t('user.onboarding.intro')}</p>
          )}
        </div>
        <div className='user-onboarding-form'>
          {signUp ? <SignUp /> : <SignIn />}
        </div>
      </div>
    </div>
  )
}

UserOnboarding.propTypes = {
  signUp: PropTypes.bool.isRequired,
  onSignInSubmit: PropTypes.func.isRequired,
  onSignUpSubmit: PropTypes.func.isRequired
}

const mapStateToProps = ({ user }) => ({
  loggedIn: user.loggedIn
})

const mapDispatchToProps = (dispatch) => ({
  onSignInSubmit: (payload) => dispatch(signIn(payload)),
  onSignUpSubmit: (payload) =>
    dispatch(signUp({ ...payload, baseurl: config.baseUrl }))
})

const UserOnboardingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserOnboarding)

export default UserOnboardingContainer
