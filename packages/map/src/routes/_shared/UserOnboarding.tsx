import { useMutation } from '@tanstack/react-query'
import { SubmissionError } from 'redux-form'
import { useLocation, useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import SignUpForm from '../../components/users/SignUpForm'
import SignInForm from '../../components/users/SignInForm'
import { MAP, useQueryString } from '../../routes'
import { signInUser, signUpUser } from '../../queries/users.api'
import { transformErrorResponse } from '../../common/formUtils'

interface UserOnboardingProps {
  signUp?: boolean
}

const useRedirectionTarget = () => {
  const { getQueryString } = useQueryString()
  const queryString = getQueryString()
  if (queryString.has('redirect')) {
    return {
      targetUrl: queryString.get('redirect') as string,
      isRedirect: true
    }
  }
  return { targetUrl: MAP, isRedirect: false }
}

const UserOnboarding = ({ signUp = false }: UserOnboardingProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { targetUrl, isRedirect } = useRedirectionTarget()

  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const signInMutation = useMutation({
    mutationFn: async (user: any) => {
      const response = await signInUser(user)
      if (response.user.email === user.email) {
        Alert.closeAll()
        Alert.success(
          t('user.onboarding.sign_in_success', { username: response.user.name })
        )
        navigate(targetUrl)
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
          {isRedirect ? (
            <p>{t('user.onboarding.protected_view_info')}</p>
          ) : (
            <p>{t('user.onboarding.intro')}</p>
          )}
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
