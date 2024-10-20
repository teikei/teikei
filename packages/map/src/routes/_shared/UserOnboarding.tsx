import { useMutation } from '@tanstack/react-query'
import { SubmissionError } from 'redux-form'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import SignUpForm from '../../components/users/SignUpForm'
import SignInForm from '../../components/users/SignInForm'
import { MAP } from '../../routes'
import { signInUser, signUpUser } from '../../queries/users.api'
import { transformErrorResponse } from '../../common/formUtils'

interface UserOnboardingProps {
  signUp?: boolean
}

const UserOnboarding = ({ signUp = false }: UserOnboardingProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // TODO implement protected view and return to fromLocation
  // const fromLocation =
  //   history.location.state &&
  //   history.location.state.from &&
  //   history.location.state.from.pathname

  // useEffect(() => {
  //   if (currentUser) {
  //     // TODO implement protected view and return to fromLocation
  //     // navigate(fromLocation || MAP)
  //     navigate(MAP)
  //   }
  // }, [currentUser])

  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const signInMutation = useMutation({
    mutationFn: async (user: any) => {
      const response = await signInUser(user)
      if (response.user.email === user.email) {
        Alert.closeAll()
        Alert.success(
          `Hallo ${response.user.name}, Du hast Dich erfolgreich angemeldet.`
        )
        navigate(MAP)
      } else {
        throw new SubmissionError(transformErrorResponse(response))
      }
      return response
    },
    meta: {
      errorMessage: t('errors.sign_in_failed_long_text')
    }
  })

  const signUpMutation = useMutation({
    mutationFn: async (user: any) => {
      const response = await signUpUser(user)
      if (response.type === 'User') {
        setSignUpSuccess(true)
      } else {
        throw new SubmissionError(transformErrorResponse(response))
      }
      return response
    },
    meta: {
      errorMessage: t('errors.sign_up_failed_long_text')
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
          <h2>{t('user.onboarding.title')}</h2>
          {/* {fromLocation ? ( */}
          {/*  <p>{t('user.onboarding.protected_view_info')}</p> */}
          {/* ) : ( */}
          {/*  <p>{t('user.onboarding.intro')}</p> */}
          {/* )} */}
          <p>{t('user.onboarding.intro')}</p>
        </div>
        <div className='user-onboarding-form'>
          {signUp ? (
            <SignUpForm
              onSubmit={handleSignUpSubmit}
              signUpSuccess={signUpSuccess}
            />
          ) : (
            <SignInForm onSubmit={handleSignInSubmit} />
          )}
        </div>
      </div>
    </div>
  )
}

export default UserOnboarding
