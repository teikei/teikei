import { useEffect } from 'react'
import SignUpForm from './tabs/SignUpForm'
import SignInForm from './tabs/SignInForm'
import i18n from '../../i18n'
import { history, MAP } from '../../AppRouter'
import { useMutation } from '@tanstack/react-query'
import { signInUser, signUpUser } from '../../api/user'
import Alert from 'react-s-alert'
import { transformErrorResponse } from '../../common/formUtils'
import { SubmissionError } from 'redux-form'
import { useGlobalState } from '../../StateContext'

interface UserOnboardingProps {
  signUp?: boolean
}

const UserOnboarding = ({
  signUp = false
}: UserOnboardingProps): JSX.Element => {
  const { currentUser, setCurrentUser } = useGlobalState()

  const fromLocation =
    history.location.state &&
    history.location.state.from &&
    history.location.state.from.pathname

  useEffect(() => {
    if (currentUser) {
      history.push(fromLocation || MAP)
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
        history.push(MAP)
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
        history.push(MAP)
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
