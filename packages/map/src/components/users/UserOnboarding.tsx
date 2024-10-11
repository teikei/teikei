import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { SubmissionError } from 'redux-form'

import SignUpForm from './SignUpForm'
import SignInForm from './SignInForm'
import i18n from '../../i18n'
import { MAP } from '../../routes'
import { signInUser, signUpUser } from '../../queries/users.api.ts'
import Alert from 'react-s-alert'
import { transformErrorResponse } from '../../common/formUtils'
import { useGlobalState } from '../../StateContext'
import { useNavigate } from 'react-router'

interface UserOnboardingProps {
  signUp?: boolean
}

const UserOnboarding = ({ signUp = false }: UserOnboardingProps) => {
  const navigate = useNavigate()
  const { currentUser, setCurrentUser } = useGlobalState()

  // TODO implement protected view and return to fromLocation
  // const fromLocation =
  //   history.location.state &&
  //   history.location.state.from &&
  //   history.location.state.from.pathname

  useEffect(() => {
    if (currentUser) {
      navigate(fromLocation || MAP)
    }
  }, [currentUser])

  const signInMutation = useMutation({
    mutationFn: async (user: any) => {
      const response = await signInUser(user)
      if (response.user.email === user.email) {
        Alert.closeAll()
        Alert.success(
          `Hallo ${response.user.name}, Du hast Dich erfolgreich angemeldet.`
        )
        setCurrentUser(response.user)
        navigate(MAP)
      } else {
        throw new SubmissionError(transformErrorResponse(response))
      }
      return response
    },
    onError: (error: { message: string }) => {
      Alert.error(
        `Du konntest nicht angemeldet werden. Bitte überprüfe Deine Angaben. / ${error.message}`
      )
    }
  })

  const signUpMutation = useMutation({
    mutationFn: async (user: any) => {
      const response = await signUpUser(user)
      if (response.id === user.id) {
        Alert.closeAll()
        Alert.success(
          `Hallo ${response.name}, Du hast Dich erfolgreich angemeldet.`
        )
        navigate(MAP)
      } else {
        throw new SubmissionError(transformErrorResponse(response))
      }
      return response
    },
    onError: (error: { message: string }) => {
      Alert.error(
        `Du konntest nicht registriert werden. Bitte überprüfe Deine Angaben. / ${error.message}`
      )
    }
  })

  const handleSignInSubmit = (values: any) => {
    signInMutation.mutate(values)
  }

  const handleSignUpSubmit = (values: any) => {
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
