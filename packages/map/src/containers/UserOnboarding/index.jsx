import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import SignUpForm from './tabs/SignUpForm'
import SignInForm from './tabs/SignInForm'
import i18n from '../../i18n'
import { history, MAP } from '../../AppRouter'
import { useMutation } from '@tanstack/react-query'
import { signInUser, signUpUser } from '../../api/user'
import Alert from 'react-s-alert'
import { transformErrorResponse } from '../../common/formUtils'
import { SubmissionError } from 'redux-form'

const UserOnboarding = ({ signUp = false }) => {
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

  const signInMutation = useMutation({
    mutationFn: async (user) => {
      const response = await signInUser(user)
      if (response.user.email === user.email) {
        Alert.closeAll()
        Alert.success(
          `Hallo ${response.user.name}, Du hast Dich erfolgreich angemeldet.`
        )
        history.push(MAP)
      } else {
        throw new SubmissionError(transformErrorResponse(response))
      }
      return response
    },
    onError: (error) => {
      Alert.error(
        `Du konntest nicht angemeldet werden. Bitte überprüfe Deine Angaben. / ${error.message}`
      )
    }
  })

  const signUpMutation = useMutation({
    mutationFn: async (user) => {
      const response = await signUpUser(user)
      if (response.id === user.id) {
        Alert.closeAll()
        Alert.success(
          `Hallo ${res.user.name}, Du hast Dich erfolgreich angemeldet.`
        )
        history.push(MAP)
      } else {
        throw new SubmissionError(transformErrorResponse(response))
      }
      return response
    },
    onError: (error) => {
      Alert.error(
        `Du konntest nicht registriert werden. Bitte überprüfe Deine Angaben. / ${error.message}`
      )
    }
  })

  const handleSignInSubmit = (values) => {
    signInMutation.mutate(values)
  }

  const handleSignUpSubmit = (values) => {
    signUpMutation.mutate(values)
  }

  return (
    <div className='user-onboarding'>
      <div className='user-container'>
        <div className='user-onboarding-intro'>
          <h2>{i18n.t('user.onboarding.title')}</h2>
          {fromLocation ? (
            <p>{i18n.t('user.onboarding.protected_view_info')}</p>
          ) : (
            <p>{i18n.t('user.onboarding.intro')}</p>
          )}
        </div>
        <div className='user-onboarding-form'>
          {signUp ? (
            <SignUpForm onSubmit={handleSignUpSubmit} />
          ) : (
            <SignInForm onSubmit={handleSignInSubmit} />
          )}
        </div>
      </div>
    </div>
  )
}

export default UserOnboarding
